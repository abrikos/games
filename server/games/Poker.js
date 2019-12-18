import Mongoose from "server/db/Mongoose";
import {rword} from "rword";
//import * as Games from "server/games";
const logger = require('logat');


export default class {
    constructor(app) {
        this.app = app;
        this.options = [
            //{name: "defaultBet", type: "number", step:0.01, label: "Default bet", default:100},
            {name: "blind", type: "select", options: [{label: '1/2', value: 1}, {label: '5/10', value: 5}, {label: '10/20', value: 10}, {label: '100/200', value: 100},], label: "Blinds", default: 5},
            {name: "dices", type: "select", options: [2, 3, 4, 5], label: "Count of dices", default: 2},
            {name: "maxPlayers", type: "select", options: [2, 3, 4, 5], label: "Max players", default: 3},
            {name: "waitPlayer", type: "range", min: 30, max: 120, label: "Seconds to wait players turn", default: 45}
        ];
    }

    leave({id, userId}) {
        this.getRecord(id)
            .then(record => {
                const site = record.siteOfPlayer(userId);
                site.data = null;
                site.player = null;
                site.stake = 0;
                if (record.sitesActive.length === 1) {
                    const player = record.sitesActive[0].player;
                    const bet = record.betOfPlayer(player._id);
                    if (bet) {
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
                this._websocketSend('leave', record, userId);
            });
    }

    create({postBody, userId}) {
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
                this._takeSite({player, record, userId});
                this._websocketSend('create', record, userId);
            })

    }

    _takeSite({player, record, siteId}) {
        const stake = record.options.blind * 100;
        let site = record.sites.find(s => s._id.toString() === siteId);
        if (!site) site = record.sites[0];
        site.player = player;
        site.stake = stake;
        player.addBalance(-stake);
        if (record.sitesActive.length === 2) {
            this._startPot(record);
            //await this._startGame();
            //this.logicNextTurn(this.sitesActive[0]);
        }
    }

    _startPot(record) {
        console.log('POT to START');
        const round = {bets: [], turn: record.sitesActive[0]._id};
        record.pots.push({
            sites: record.sitesActive,
            rounds: [round]
        });
        this._bet(record, record.sitesActive[0].player, record.options.blind);
        this._bet(record, record.sitesActive[1].player, record.options.blind * 2);
    }

    _bet(record, player, value) {
        //if (record.logicPlayerBet(value, player)) return;
        const site = record.siteOfPlayer(player);
        const lastBet = record.betOfPlayer(player);
        if (lastBet && record.maxBet > lastBet.value + value) return logger.warn('Not enough to Call');
        site.stake -= value;
        const bet = {value, site};
        //site.bets.push(bet);
        record.round.bets.push(bet);
        let idx = record.sitesOfPot.map(s => s.toString()).indexOf(record.round.turn.toString()) + 1;
        if (idx === record.sitesOfPot.length) idx = 0;
        record.round.turn = record.sitesOfPot[idx];
    }

    bet({id, userId, value}) {
        this.getRecord(id)
            .then(async record => {
                if (!record.turnSite.player.equals(userId)) return logger.warn('Not you turn')
                this._bet(record, userId, value);
                this._checkEndPot(record);
                record.save();
                this._websocketSend('bet', record);
            });
    }

    fold({id, userId}) {
        this.getRecord(id)
            .then(async record => {
                const site = record.siteOfPlayer(userId);
                record.pot.sites = record.pot.sites.filter(s => !s.equals(site._id));
                this._checkEndPot(record);
                record.save();
                this._websocketSend('fold', record);
            });
    }

    _checkEndPot(record) {
        logger.info('Check end')
    }

    join({id, userId, siteId}) {
        this.getRecord(id)
            .then(record => {
                Mongoose.User.findById(userId)
                    .then(player => {
                        if (record.siteOfPlayer(player)) return;
                        if (!record.canJoin) return;
                        this._takeSite({player, record, siteId});
                        record.save();
                        this._websocketSend('join', record, userId);
                    })
            })
    }

    stakeChange({id, userId, amount, factor}) {
        this.getRecord(id)
            .then(record => {
                const site = record.siteOfPlayer(userId);
                const a = amount * factor;
                site.stake += a;
                if (site.stake <= 0) return;
                site.player.addBalance(-a);
                record.save()
                    .then(t => {
                        this._websocketSend('stake/change', record, userId);
                        //res.send({site, balance: {amount: site.player.balance}})
                    })

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

    _websocketSend(action, record, player) {
        this.app.locals.wss.clients.forEach(function each(client) {
            client.send(JSON.stringify({action, id: record.id, game: 'poker', timestamp: new Date(), player: player}));
        });
    }
};
