import Mongoose from "server/db/Mongoose";
import {rword} from "rword";

const logger = require('logat');


export default class Poker {
    get _cards() {
        return {suits: ['S', 'C', 'D', 'H'], values: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']};
    }

    get _roundTypes() {
        return [{name: 'pre', cards: 0}, {name: 'flop', cards: 3}, {name: 'turn', cards: 1}, {name: 'river', cards: 1}];
    }

    constructor(app) {
        this.app = app;
    }

    get _deck() {
        let deck = ['H3', 'S3'];
        deck = deck.concat(['HK', 'S2']);
        deck = deck.concat(['HQ', 'SQ']);
        deck = deck.concat(['D3', 'S9', 'H8', 'CJ', 'C5']);
        return deck.reverse().map(c => this._card(c));
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
        if (record.table.sitesActive.length === 1) {
            const player = record.table.sitesActive[0].player;
            const bet = record.betOfPlayer(player._id);
            if (bet) {
                player.addBalance(bet.value);
            }
            record.pots = [];
            //leave(record, record.table.sitesActive[0].player._id);
        }
        if (record.table.sitesActive.length === 0) {
            record.active = false;
        }
        await record.save();
        this._websocketSend('leave', record, userId);
        return record;
    }



    /*async create(table, postBody, player) {
        const record = new Mongoose.poker({table});
        //const words = rword.generate(2, {length: '3-4'}).join(' ');
        /!*record.name = words.replace(/^./, words[0].toUpperCase());
        record.options = {};
        for (const option of this.options) {
            const value = postBody[option.name] || option.default;
            record.options[option.name] = value;
        }*!/

        /!*const player = await Mongoose.User.findById(userId);
        for (let position = 0; position < record.maxPlayers; position++) {
            //const player = position ? null : user;
            record.table.sites.push({position})
        }*!/
        //await record.populate(Mongoose.poker.population).execPopulate();
        this._takeSite({player, record});
        await record.save();
        //this._websocketSend('create', record, player.id);
        return record;
    }*/

    _takeSite({player, record, siteId}) {
        if (!record.table.sites.find(s => !s.player)) return logger.warn('No sites available');
        const stake = record.options.blind * 100;
        let site = record.table.sites.find(s => s.equals(siteId));
        if (!site) {
            site = record.table.sites.find(s => !s.player);
        }
        site.player = player;
        site.stake = stake;
        player.addBalance(-stake);
        if (record.table.sitesActive.length === 2) {
            //this._startPot(record);
            //await this._startGame();
            //this.logicNextTurn(this.table.sitesActive[0]);
        }
        return site;
    }

    async onJoin(record) {
        if(record.table.playersCount===2){
            this._newPot(record);
        }
        //this._websocketSend('join', record, player._id);
        await record.save();
        return record;
    }


    _newPot(record) {
        //if (record.pot) return;
        const round = {turn: record.table.sitesActive[0], type: this._roundTypes[0].name};
        record.pots.push({
            deck: this._deck,
            bets: [],
            sites: record.table.sitesActive,
            rounds: [round]
        });
        //logger.info(record.table.sitesActive)

        for (const siteId of record.pot.sites) {
            const site = record.table.sites.find(s=>s.equals(siteId));
            const c1 = record.pot.deck.pop();
            const c2 = record.pot.deck.pop();
            site.cards = [c1, c2]
        }
        logger.info(record.pot.sites)
        const site0 = record.table.sites.id(record.pot.sites[0].siteId);
        const site1 = record.table.sites.id(record.pot.sites[1].siteId);

        site0.blind = 1;
        site1.blind = 2;
        this._bet(record, site0.player, record.options.blind);
        this._bet(record, site1.player, record.options.blind * 2);
    }

    _bet(record, player, value) {
        //if (record.logicPlayerBet(value, player)) return;
        const site = record.siteOfPlayer(player);
        const sumBet = record.playerSumBet(player);
        if (record.maxBet > sumBet + value) return logger.warn('Not enough to Call');
        site.stake -= value;
        const bet = {value, site};
        //site.bets.push(bet);
        record.pot.round.bets.push(bet);
        record.pot.round.turn = record.nextTurn;
    }

    async bet(id, userId, value) {
        const record = await this.getRecord(id);
        const site = record.siteOfPlayer(userId);
        if (!record.turnSite.player.equals(userId)) return logger.warn('---------------Not you turn');
        if(value>site.stake) return logger.warn(`Bet ${value} more than stake ${site.stake}`);
        if (value >= 0) {
            this._bet(record, userId, value);
            if(site.stake === value){
                //All in
                record.pots.push(record.pot);
                record.pot.sites = record.pot.sites.filter(s => !site.equals(s.siteId));
            }
        } else {
            //FOLD
            record.pot.round.turn = record.nextTurn;
            record.pot.sites = record.pot.sites.filter(s => !site.equals(s.siteId));
        }
        this._checkNextRound(record);
        await record.save();
        this._websocketSend('bet', record);

        return record;
    }

    _checkNextRound(record) {
        const values = record.sitesBetSum.map(b => b.sum);
        const lastBet = record.lastBet;
        const lastSite = record.table.sites.id(lastBet.site);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const pre = record.pot.round.type === 'pre' ? 2:0;
        const finished = !((record.pot.round.bets.length - pre) % record.pot.sites.length)
        //console.log(record.pot.round.type, record.pot.round.bets.length ,'%',record.pot.sites.length , '=', (record.pot.round.bets.length ) % record.pot.sites.length, finished)
        if (min === max && finished) {
            this._nextRound(record)
        }
    }

    _nextRound(record) {
        const newRoundType = this._roundTypes[record.pot.rounds.length];

        //if (record.pot.round.type === this._roundTypes[this._roundTypes.length - 1].name) {
        if(!newRoundType){
            logger.info('FINISH POT');
            this._endGame(record)
        } else {
            logger.info('NEW ROUND', newRoundType.name);
            record.pot.rounds.push({turn: record.pot.sites[0].siteId, type: newRoundType.name, cards: record.pot.round.cards.concat(record.pot.deck.splice(0, newRoundType.cards))});
        }

    }

    static combination(cards, table){
        return _combination(cards, table)
    }

    _endGame(record) {
        const table = record.pot.rounds[record.pot.rounds.length - 1].cards;
        for (const pot of record.potsOpen) {
            for (const s of pot.sites) {
                const site = record.table.sites.find(s2=>s2.equals(s.siteId));
                //logger.info(site)
                site.result = _combination(site.cards, table)

            }

            const winners = this._winners(pot.sites.map(s=>record.table.sites.id(s.siteId)));
            for (const site of winners) {
                site.stake += pot.sum / winners.length;
            }
        }
        record.pot.closed = true;
        record.active = false;
        //this._startPot(record)
    }


    _winners(sites) {
        const maxPriority = sites.sort((b, a) => a.result.priority - b.result.priority)[0].result.priority;
        const tops = sites.filter(c => c.result.priority === maxPriority);
        const name = tops[0].result.name;
        logger.info(name)
        let sum = 0;
        const p = tops[0].result.sum ? 'sum' : 'idx'
        for (const t of tops) {
            if (t.result[p] > sum) sum = t.result[p];
        }
        return tops.filter(t => t.result[p] === sum)

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
        return await Mongoose.poker.findOne({table:id}).populate(Mongoose.poker.population);
        /*const promise = new Promise((resolve, reject) => {
            Mongoose.poker.findById(id).populate(Mongoose.poker.population)
                .then(resolve).catch(reject)
        });
        const record = await promise;
        //record.extendLogic();
        return record;*/
    }

    _websocketSend(action, record, player) {
        this.app.locals.wss.clients.forEach(function each(client) {
            client.send(JSON.stringify({action, id: record.table.id, game: 'poker', timestamp: new Date(), player: player}));
        });
    }
};


function _combinationSum(combination) {
    return combination.map(c => 2 ** c.idx).reduce((a, b) => a + b)
}


function _combination(hand, table) {
    const sorted = hand.concat(table).sort((a, b) => b.idx - a.idx);
    const flush = _getFlush(sorted);
    if (flush && flush.straight) return flush;
    const care = _getByValues(4, sorted);
    if (care) return care;
    if (flush) return flush;
    const straight = _getStraight(sorted);
    if (straight) return straight;
    const set = _getByValues(3, sorted);
    if (set) return set;
    const double = _getDouble(sorted);
    if (double) return double;
    const pair = _getByValues(2, sorted);
    if (pair) return pair;
    return _getHighCard(sorted);
}

function _getHighCard(source) {
    const combination = source.splice(0, 5);
    return {combination, sum: _combinationSum(combination), name: "High card", priority: 1}
}

function _getDouble(sorted) {
    const combination = [];
    for (const s of sorted) {
        if (combination.length === 4) break;
        if (sorted.filter(s2 => s2.idx === s.idx).length === 2) combination.push(s)
    }
    const kickers = sorted.filter(s => !combination.map(c => c.idx).includes(s.idx))
    if (combination.length !== 4) return;
    combination.push(kickers[0])
    return combination && {combination, sum: _combinationSum(combination), name: "Two pairs", priority: 2.5}
}


function _getByValues(count, source) {
    const names = {4: "Care", 3: "Set", 2: "Pair"};
    const sorted = Object.assign([], source);
    let obj = {};
    for (const s of sorted) {
        if (!obj[s.value]) obj[s.value] = [];
        obj[s.value].push(s);
    }
    const matched = Object.keys(obj).find(key => obj[key].length === count);
    let combination = obj[matched];
    const kickersCount = -7 - count;
    const kickers = sorted.filter(c => c.value !== matched)
        .splice(kickersCount - 2, 5 - count);
    if (!combination) return;
    combination = combination.concat(kickers);
    return {combination, sum: _combinationSum(combination), name: names[count], priority: count}
}


function _getFlush(sorted) {
    const suites = {};
    let flush;
    for (const s of sorted) {
        if (!suites[s.suit]) suites[s.suit] = [];
        suites[s.suit].push(s);
        //logger.info(s)

        if (suites[s.suit].length === 5) {
            flush = suites[s.suit];
        }
    }
    //logger.info(flush.splice(0,5))
    if (!flush) return;
    const straight = this._getStraight(flush);
    let name;
    let priority;
    let combination;
    if (straight) {
        combination = straight.combination;
        name = flush[0].idx === 12 ? 'Flush Royal' : 'Straight flush';
        priority = 7
    } else {
        name = 'Flush';
        priority = 6;
        combination = flush.splice(0, 5)
    }
    //logger.info(combination)
    return {combination, max: combination[0], sum: _combinationSum(combination), straight: !!straight, name, priority}
}


function _getStraight(source) {
    function check(card) {
        try {
            return sorted.find(c => c.idx === card.idx - 1)
                && sorted.find(c => c.idx === card.idx - 2)
                && sorted.find(c => c.idx === card.idx - 3)
                && sorted.find(c => c.idx === card.idx - 4)
        } catch (e) {
            return false;
        }
    }

    const sorted = Object.assign([], source);
    if (sorted[0].idx === 12) {
        const ace = Object.assign({}, sorted[0]);
        ace.idx = -1;
        sorted.push(ace)
    }
    let combination = [];
    for (const card of sorted) {
        if (check(card)) {
            combination.push(card);
            for (let i = 1; i < 5; i++) {
                combination.push(sorted.find(c => c.idx === card.idx - i))
            }
            return {combination, max: combination[0], name: 'Straight', priority: 5}
        }
    }


}
