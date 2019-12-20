import Mongoose from "server/db/Mongoose";
import {rword} from "rword";

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
        return this._deckStraight.sort(function () {
            return 0.5 - Math.random()
        });
    }

    _card(name) {
        return this._deckStraight.find(c => c.suit + c.value === name);
    }

    get _deckStraight() {
        const d = [];
        for (const suit of this._cards.suits) {
            for (let idx = 0; idx < this._cards.values.length; idx++) {
                d.push({suit, value: this._cards.values[idx], idx})
            }
        }
        return d;
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
        const site0 = record.sites.id(record.pot.sites[0]);
        const site1 = record.sites.id(record.pot.sites[1]);

        site0.blind = 1;
        site1.blind = 2;
        this._bet(record, site0.player, record.options.blind);
        this._bet(record, site1.player, record.options.blind * 2);
    }

    _bet(record, player, value) {
        //if (record.logicPlayerBet(value, player)) return;
        const site = record.siteOfPlayer(player);

        const sumBet = record.playerSumBet(player);
        logger.info(record.maxBet, sumBet, value);
        if (record.maxBet > sumBet + value) return logger.warn('Not enough to Call');
        site.stake -= value;
        const bet = {value, site};
        //site.bets.push(bet);
        record.round.bets.push(bet);
        let idx = record.sitesOfPot.map(s => s.toString()).indexOf(record.round.turn.toString()) + 1;
        if (idx === record.sitesOfPot.length) idx = 0;
        record.round.turn = record.sitesOfPot[idx];
    }

    async bet(id, userId, value) {
        const record = await this.getRecord(id);
        if (!record.turnSite.player.equals(userId)) return logger.warn('---------------Not you turn')
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
        const values = record.sitesBetSum.map(b => b.sum);
        const lastBet = record.lastBet;
        const lastSite = record.sites.id(lastBet.site);
        const min = Math.min(...values);
        const max = Math.max(...values);
        //logger.info(min , max , lastSite.blind )
        if (min === max && lastSite.blind === 2) {
            this._nextRound(record)
        }
    }

    _nextRound(record) {
        const newRoundType = this._roundTypes[record.pot.rounds.length];
        if (record.round.type === this._roundTypes[this._roundTypes.length - 1].name) {
            this._finishPot(record)
        } else {
            record.pot.rounds.push({turn: record.pot.sites[0], type: newRoundType.name, cards: record.pot.deck.splice(0, newRoundType.cards)});
        }

    }

    _winners(winners, table) {
        const sorted = winners.sort((b, a) => a.combination.priority - b.combination.priority);
        const max = sorted[0].priority;
        const top = winners.filter(c=>c.combination.priority===max);
        logger.info(top)
    }

    _combination(hand, table) {
        const sorted = hand.concat(table).sort((a, b) => b.idx - a.idx);
        const flush = this._getFlush(sorted);
        if (flush && flush.straight) return flush;
        const care = this._getByValues(4, sorted);
        if (care) return care;
        if (flush) return flush;
        const straight = this._getStraight(sorted);
        if (straight) return straight;
        const set = this._getByValues(3, sorted);
        if (set) return set;
        const double = this._getDouble(sorted);
        if (double) return double;
        const pair = this._getByValues(2, sorted);
        if (pair) return pair;
        const one = this._getHighCard(sorted);
        return one;

    }

    _getHighCard(source) {
        return {combination: source[0], kickers: source.splice(1, 4), name: "High card", priority: 1}
    }

    _getDouble(source) {
        const sorted = Object.assign([], source);
        let obj = {};
        for (const s of sorted) {
            if (!obj[s.value]) obj[s.value] = [];
            obj[s.value].push(s);
        }

        const matched = Object.keys(obj).filter(key => obj[key].length === 2);
        if (matched.length !== 2) return;
        const combination = obj[matched[0]].concat(obj[matched[1]]);
        const kickers = sorted.filter(c => matched.indexOf(c.value) === -1)
            .splice(0, 1);
        return combination && {combination, kickers, name: "Two pairs", priority: 2.5}
    }


    _getByValues(count, source) {
        const names = {4: "Care", 3: "Set", 2: "Pair"};
        const sorted = Object.assign([], source);
        let obj = {};
        for (const s of sorted) {
            if (!obj[s.value]) obj[s.value] = [];
            obj[s.value].push(s);
        }
        const matched = Object.keys(obj).find(key => obj[key].length === count);
        const combination = obj[matched];
        const kickersCount = -7 - count;
        const kickers = sorted.filter(c => c.value !== matched)
            .splice(kickersCount - 2, 5 - count);
        return combination && {combination, kickers, name: names[count], priority: count}
    }


    _getFlush(source) {
        const sorted = Object.assign([], source);
        const suites = {};
        let flush;
        for (const s of sorted) {
            if (!suites[s.suit]) suites[s.suit] = [];
            suites[s.suit].push(s);
            if (suites[s.suit].length === 5) flush = suites[s.suit];
        }
        const straight = flush && this._getStraight(flush);
        let name;
        let priority;
        if (straight) {
            flush = straight.combination;
            name = flush[0].idx === 12 ? 'Flush Royal' : 'Straight flush'
            priority = 7
        } else {
            name = 'Flush';
            priority = 6;
        }
        return flush && {combination: flush, max: flush[0], min: flush[flush.length - 1], straight: !!straight, name, priority}
    }


    _getStraight(source) {
        const sorted = Object.assign([], source);
        if (sorted[0].idx === 12) {
            const ace = Object.assign({}, sorted[0]);
            ace.idx = -1;
            sorted.push(ace)
        }
        const straight = [];
        for (let i = 0; i < sorted.length; i++) {

            if (sorted[i + 1]) {
                if (sorted[i].idx - sorted[i + 1].idx === 1) {
                    if (!straight.length) straight.push(sorted[i]);
                    straight.push(sorted[i + 1])
                }
            }
            if (straight.length === 5) break;
        }
        return straight.length === 5 && {combination: straight, max: straight[0], min: straight[straight.length - 1], name: 'Stright', priority: 5}
    }

    _finishPot(record) {
        logger.info('TODO get winners')
    }

    async stakeChange(id, userId, postBody) {
        const record = await this.getRecord(id);
        const site = record.siteOfPlayer(userId);
        const a = postBody.amount * postBody.factor;
        site.stake += a;
        if (site.stake <= 0) return;
        site.player.addBalance(-a);
        await record.save();
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
