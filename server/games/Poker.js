import Mongoose from "server/db/Mongoose";
import {rword} from "rword";
//import * as Games from "server/games";
const logger = require('logat');


export default class Poker {
    get _cards() {
        return {suits: ['S', 'C', 'D', 'H'], values: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']};
    }

    get options() {
        return [
            //{name: "defaultBet", type: "number", step:0.01, label: "Default bet", default:100},
            {name: "blind", type: "select", options: [{label: '1/2', value: 1}, {label: '5/10', value: 5}, {label: '10/20', value: 10}, {label: '100/200', value: 100},], label: "Blinds", default: 5},
            {name: "dices", type: "select", options: [2, 3, 4, 5], label: "Count of dices", default: 2},
            {name: "maxPlayers", type: "select", options: [2, 3, 4, 5], label: "Max players", default: 3},
            {name: "waitPlayer", type: "range", min: 30, max: 120, label: "Seconds to wait players turn", default: 45}
        ];
    }

    get _roundTypes() {
        return [{name: 'pre', cards: 0}, {name: 'flop', cards: 3}, {name: 'turn', cards: 1}, {name: 'river', cards: 1}];
    }

    constructor(app) {
        this.app = app;
    }

    get _deck() {
        const d = [];
        for (const s of this._cards.suits) {
            for (const v of this._cards.values) {
                d.push(s + v)
            }
        }
        return d.sort(function () {
            return 0.5 - Math.random()
        });
    }


    async leave(id, userId) {
        const record = await this.getRecord(id);
        const site = record.siteOfPlayer(userId);
        site.cards = null;
        site.player = null;
        site.stake = 0;
        if (record.sitesActive.length === 1) {
            const player = record.sitesActive[0].player;
            const bet = record.betOfPlayer(player._id);
            if (bet) {
                player.addBalance(bet.value);
            }
            record.pots = [];
            //leave(record, record.sitesActive[0].player._id);
        }
        if (record.sitesActive.length === 0) {
            record.active = false;
        }
        await record.save();
        this._websocketSend('leave', record, userId);
        return record;
    }

    async create(postBody, userId) {
        const record = new Mongoose.Poker();
        const words = rword.generate(2, {length: '3-4'}).join(' ');
        record.name = words.replace(/^./, words[0].toUpperCase());
        record.options = {};
        for (const option of this.options) {
            const value = postBody[option.name] || option.default;
            record.options[option.name] = value;
        }

        const player = await Mongoose.User.findById(userId);
        for (let position = 0; position < record.maxPlayers; position++) {
            //const player = position ? null : user;
            record.sites.push({position})
        }
        record.realMode = player.realMode;

        await record.populate(Mongoose.Poker.population).execPopulate();
        this._takeSite({player, record, userId});
        await record.save();
        this._websocketSend('create', record, userId);
        return record;
    }

    _takeSite({player, record, siteId}) {
        const stake = record.options.blind * 100;
        let site = record.sites.find(s => s._id.toString() === siteId);
        if (!site) site = record.sites.find(s => !s.player);
        site.player = player;
        site.stake = stake;
        player.addBalance(-stake);
        if (record.sitesActive.length === 2) {
            this._startPot(record);
            //await this._startGame();
            //this.logicNextTurn(this.sitesActive[0]);
        }
    }

    async join(id, userId, siteId) {
        const record = await this.getRecord(id);
        const player = await Mongoose.User.findById(userId);
        if (record.siteOfPlayer(player)) return;
        if (!record.canJoin) return;
        this._takeSite({player, record, siteId});
        this._websocketSend('join', record, player._id);
        await record.save();
        return record;
    }



    _startPot(record) {
        console.log('POT to START');
        const round = {turn: record.sitesActive[0]._id, type: this._roundTypes[0].name};
        record.pots.push({
            deck: this._deck,
            bets: [],
            sites: record.sitesActive,
            rounds: [round]
        });

        for (const siteId of record.pot.sites) {
            const site = record.sites.id(siteId);
            const c1 = record.pot.deck.pop();
            const c2 = record.pot.deck.pop();
            site.cards = [c1, c2]
        }

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
        record.pot.bets.push(bet);
        let idx = record.sitesOfPot.map(s => s.toString()).indexOf(record.round.turn.toString()) + 1;
        if (idx === record.sitesOfPot.length) idx = 0;
        record.round.turn = record.sitesOfPot[idx];
    }

    async bet(id, userId, value) {
        const record = await this.getRecord(id);
        if (!record.turnSite.player.equals(userId)) return logger.warn('Not you turn')
        this._bet(record, userId, value);
        this._checkNextRound(record);
        await record.save();
        this._websocketSend('bet', record);
        return record;
    }

    async fold(id, userId) {
        const record = await this.getRecord(id);
        const site = record.siteOfPlayer(userId);
        record.pot.sites = record.pot.sites.filter(s => !s.equals(site._id));
        this._checkNextRound(record);
        await record.save();
        this._websocketSend('fold', record);
        return record;
    }

    _checkNextRound(record) {
        const values = record.sitesBets.map(b => b.sum)

        const min = Math.min(...values);
        const max = Math.max(...values);
        //TODO big blaind can rise
        if (min === max) {
            if (record.round.type === this._roundTypes[this._roundTypes.length - 1].name) {
                return this._finishPot(record)
            }
            const newRoundType = this._roundTypes[record.pot.rounds.length];
            record.pot.rounds.push({turn: record.pot.sites[0], type: newRoundType.name, cards: record.pot.deck.splice(0, newRoundType.cards)});
        }
    }

    _finishPot(record) {
        logger.info('TODO get winners')
    }

    async stakeChange(id, userId, postBody) {
        const record = await this.getRecord(id)
        const site = record.siteOfPlayer(userId);
        const a = postBody.amount * postBody.factor;
        site.stake += a;
        if (site.stake <= 0) return;
        site.player.addBalance(-a);
        await record.save()
        this._websocketSend('stake/change', record, userId);
        return record;
        //res.send({site, balance: {amount: site.player.balance}})
    }

    async getRecord(id) {
        return await Mongoose.Poker.findById(id).populate(Mongoose.Poker.population);
        /*const promise = new Promise((resolve, reject) => {
            Mongoose.Poker.findById(id).populate(Mongoose.Poker.population)
                .then(resolve).catch(reject)
        });
        const record = await promise;
        //record.extendLogic();
        return record;*/
    }

    _websocketSend(action, record, player) {
        this.app.locals.wss.clients.forEach(function each(client) {
            client.send(JSON.stringify({action, id: record.id, game: 'poker', timestamp: new Date(), player: player}));
        });
    }
};
