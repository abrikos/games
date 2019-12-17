import Mongoose from "server/db/Mongoose";
import {rword} from "rword";
//import * as Games from "server/games";
const logger = require('logat');
const EventEmitter = require('events');


export default class extends EventEmitter {
    constructor(app) {
        super();
        this.app = app;
        this.options = [
            //{name: "defaultBet", type: "number", step:0.01, label: "Default bet", default:100},
            {name: "blind", type: "select", options: [{label: '1/2', value: 1}, {label: '5/10', value: 5}, {label: '10/20', value: 10}, {label: '100/200', value: 100},], label: "Blinds", default: 5},
            {name: "dices", type: "select", options: [2, 3, 4, 5], label: "Count of dices", default: 2},
            {name: "maxPlayers", type: "select", options: [2, 3, 4, 5], label: "Max players", default: 3},
            {name: "waitPlayer", type: "range", min: 30, max: 120, label: "Seconds to wait players turn", default: 45}
        ];

        this.on('bet', ({id, userId, value}) => {
            this.getRecord(id)
                .then(async record => {
                    if (!await record.logicPlayerBet(value, player)) return;
                    logger.info(record.siteNextTurn);
                    record.logicNextTurn(record.siteNextTurn);
                    this.websocketSend('bet', record);
                });
        });


        this.on('leave', ({id, userId}) => {
            this.getRecord(id)
                .then(record => {
                    const site = record.siteOfPlayer(userId);
                    const bet = record.betOfPlayer(userId);
                    site.data = null;
                    let betValue = 0;
                    if (bet) {
                        betValue = bet.value;
                        bet.delete();
                        logger.warn("IS BET DELETED?",bet)
                    }
                    site.player.addBalance(site.stake + betValue);
                    site.player = null;
                    site.data = null;
                    site.stake = 0;
                    if (record.sitesActive.length === 1){
                        const player =  record.sitesActive[0].player;
                        const bet = record.betOfPlayer(player._id);
                        if(bet){
                            player.addBalance(bet.value);
                            bet.delete()
                        }
                        record.pots = [];
                        //leave(record, record.sitesActive[0].player._id);
                    }
                    if (record.sitesActive.length === 0) {
                        record.active = false;
                    }
                    record.save();
                    this.websocketSend('leave', record, userId);
                });
        });

        this.on('create', ({postBody, userId}) => {
            const record = new Mongoose.Poker();
            const words = rword.generate(2, {length: '3-4'}).join(' ');
            record.name = words.replace(/^./, words[0].toUpperCase());
            record.options = {};
            for (const option of this.options) {
                const value = postBody[option.name] || option.default;
                record.options[option.name] = value;
            }

            Mongoose.User.findById(userId)
                .then(player => {
                    for (let position = 0; position < record.maxPlayers; position++) {
                        //const player = position ? null : user;
                        record.sites.push({position})
                    }
                    record.realMode = player.realMode;
                    record.save();
                    record.populate(Mongoose.Poker.population).execPopulate();
                    this.emit('takeSite', {player, userId});
                    this.websocketSend('create', record, userId);
                })

        });

        this.on('takeSite', ({player, record, siteId}) => {
            const stake = record.options.blind * 100;
            let site = record.sites.find(s => s._id.toString() === siteId);
            if (!site) site = record.sites[0];
            site.player = player;
            site.stake = stake;
            record.save();
            player.addBalance(-stake);
            if (record.sitesActive.length === 2) {
                this.emit('start-pot')
                //await this._startGame();
                //this.logicNextTurn(this.sitesActive[0]);
            }
        });

        this.on('join',({id, userId, siteId})=>{
            this.getRecord(id)
                .then(record=>{
                    Mongoose.User.findById(userId)
                        .then(player => {
                            if (record.siteOfPlayer(player)) return;
                            if (!record.canJoin) return;
                            this.emit('takeSite', {player, record, siteId});
                            this.websocketSend('join', record, userId);
                        })
                })
        });

        this.on('stakeChange', ({id, userId, amount, factor}) => {
            this.getRecord(id)
                .then(record => {
                    const site = record.siteOfPlayer(userId);
                    const a = amount * factor;
                    site.stake += a;
                    if(site.stake<=0) return;
                    site.player.addBalance(-a);
                    record.save()
                        .then(t => {
                            this.websocketSend('stake/change', record, userId);
                            //res.send({site, balance: {amount: site.player.balance}})
                        })

                })
        });

        this.on('start-pot', () => {
            console.log('START POT')
        })
    }


    async getRecord(id) {
        const promise = new Promise((resolve, reject) => {
            Mongoose.Poker.findById(id).populate(Mongoose.Poker.population)
                .then(resolve).catch(reject)
        });
        const record = await promise;
        //record.extendLogic();
        return record;
    }

    websocketSend(action, record, player) {
        this.app.locals.wss.clients.forEach(function each(client) {
            client.send(JSON.stringify({action, id: record.id, game: 'poker', timestamp: new Date(), player: player}));
        });
    }
};
