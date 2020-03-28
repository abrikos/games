import Mongoose from "server/db/Mongoose";
import Combination from "./PokerCombination";

const logger = require('logat');


export default class Poker {
    get _cards() {
        return {suits: ['S', 'C', 'D', 'H'], values: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']};
    }

    get _roundTypes() {
        return [{name: 'pre', cards: 0}, {name: 'flop', cards: 3}, {name: 'turn', cards: 1}, {name: 'river', cards: 1}];
    }

    get _deck() {
        let deck = ['H3', 'S3'];
        deck = deck.concat(['HK', 'S2']);
        deck = deck.concat(['HQ', 'SQ']);
        deck = deck.concat(['D3', 'S9', 'H8', 'CJ', 'C5']);
        return deck.reverse().map(c => this._card(c));
        return this._deckSorted.sort(function () {
            return 0.5 - Math.random()
        });
    }

    _card(name) {
        return this._deckSorted.find(c => c.suit + c.value === name);
    }

    get _deckSorted() {
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
        site.data.cards = null;
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
        //this._websocketSend('leave', record, userId);
        return record;
    }

    async tableInfo(id){
        const record = await this.getRecord(id);
        const bets = {};
        for(const round of record.pot.rounds){

            for(const bet of round.bets){
                const user = record.table.sites.id(bet.site).player
                if(!bets[bet.site]) bets[bet.site] = {user, value:0};
                bets[bet.site].value += bet.value;
            }
        }
        logger.info(bets)
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

    /*
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
        }*/

    async onJoin(record) {
        if (record.table.playersCount === 2) {
            await this._startGame(record);
        }

        //this._websocketSend('join', record, player._id);
        await record.save();
        return record;
    }


    async _startGame(record, smallBlind) {
        console.log('NEW GAME', record.id)
        //if (record.pot) return;
        //const prevSmallBlind = record.table.sites.find(s => s.firstTurn) || record.table.sites[record.table.sites.length - 1];
        if(!smallBlind){
            smallBlind = record.table.sites[0];
        }
        smallBlind.currentTurn = true;
        await record.table.save();
        const bigBlind = record.table.nextSite(smallBlind);


        const round = {turn: smallBlind, type: this._roundTypes[0].name};
        record.pots.push({
            deck: this._deck,
            bets: [],
            sites: record.table.sitesActive.map(s => {
                return {tableSite: s.id}
            }),
            rounds: [round]
        });


        for (const site of record.pot.sites) {
            const c1 = record.pot.deck.pop();
            const c2 = record.pot.deck.pop();
            site.cards = [c1, c2]
        }

        //const site0 = record.table.sites.id(record.pot.sites[0].tableSite);
        //const site1 = record.table.sites.id(record.pot.sites[1].tableSite);

        record.pot.sites.find(s => s.tableSite.equals(smallBlind._id)).blind = 1;
        record.pot.sites.find(s => s.tableSite.equals(bigBlind._id)).blind = 2;

        this._bet(record, smallBlind.player, record.table.options.blind);
        this._bet(record, bigBlind.player, record.table.options.blind * 2);
        return record;
    }

    _bet(record, player, value) {
        //if (record.logicPlayerBet(value, player)) return;
        const site = record.table.siteOfPlayer(player);
        const sumBet = record.playerSumBet(player);
        if (record.maxBet > sumBet + value) return {error:'Not enough to Call'};
        site.stake -= value;
        const bet = {value, site};
        //site.bets.push(bet);
        record.pot.round.bets.push(bet);
        return {ok:200};
    }

    error(error){
        console.warn(error)
        return {error};
    }

    async bet(id, userId, value) {

        const record = await this.getRecord(id);
        if (!record) return logger.warn('WRONG POKER ID', id);
        const site = record.table.siteOfPlayer(userId);
        if (!record.table.turnSite.player.equals(userId)) return this.error(`WARN: ${site.player.name} Not you turn. Bet: ${value}. (turn of ${record.table.turnSite.player.name})`);
        if (value > site.stake) return (`WARN: Bet ${value} more than stake ${site.stake}`);

        const result = {status:'Rise', value};
        if (value >= 0) {
            const bet = this._bet(record, userId, value);
            if(bet.error) return this.error(bet.error)
            if (site.stake === value) {
                //All in
                record.pots.push(record.pot);
                record.pot.sites = record.pot.sites.filter(s => !site.equals(s));
                result.status = 'All In';
            }
        } else {
            //FOLD
            record.pot.sites = record.pot.sites.filter(s => !site.equals(s));
            result.status = 'Fold';
        }
        //Next turn
        const idx = record.sitesOfPot.map(s=>s.tableSite).indexOf(site._id);
        const nextPotSite = record.sitesOfPot[idx + 1] || record.sitesOfPot[0];
        const nextSite = record.table.sites.id(nextPotSite.tableSite);
        site.currentTurn = false;
        nextSite.currentTurn = true;
        logger.info('BET of  ' + site.player.name + ': ' + value + '. NEXT TURN: ' + nextSite.player.name)
        await record.table.save();

        //next round
        const values = record.sitesBetSum.map(b => b.sum);
        const min = Math.min(...values);
        const max = Math.max(...values);
        if (min === max) {
            await this._nextRound(record);
            result.status = 'Call';
        }

        await record.save();
        return result;


    }



    async _nextRound(record) {
        const newRoundType = this._roundTypes[record.pot.rounds.length];

        //if (record.pot.round.type === this._roundTypes[this._roundTypes.length - 1].name) {
        if (!newRoundType) {
            console.log('FINISH POT');
            await this._endGame(record)
        } else {
            console.log('NEW ROUND', newRoundType.name);
            record.table.sites[0].currentTurn =true;
            await record.table.save();
            record.pot.rounds.push({type: newRoundType.name, cards: record.pot.round.cards.concat(record.pot.deck.splice(0, newRoundType.cards))});
            //record.pot.round.turn = record.nextTurn;
            for (const site of record.pot.sites) {
                site.combination = Combination.calc(site.cards, record.pot.round.cards).name
                //logger.info(record.cardsOfPlayer(site.player))
            }
        }

    }

    static combination(cards, table) {
        return Combination.calc(cards, table)
    }

    async _endGame(record) {
        const table = record.pot.rounds[record.pot.rounds.length - 1].cards;
        for (const pot of record.potsOpen) {
            for (const s of pot.sites) {
                const site = record.table.sites.find(s2 => s2.equals(s.tableSite));
                //logger.info(site)
                site.result = Combination.calc(s.cards, table)

            }

            const winners = this._winners(pot.sites.map(s => record.table.sites.id(s.tableSite)));
            for (const site of winners) {
                site.stake += pot.sum / winners.length;
            }
        }
        const smallBlind = record.table.sites.id(record.pot.sites.find(s => s.blind === 1).tableSite);
        const nextSmallBlind = record.table.nextSite(smallBlind);
        record.pot.closed = true;
        record.active = false;
        const newRecord = await Mongoose.poker.create({table: record.table});

        await this._startGame(newRecord, nextSmallBlind);
        await newRecord.save();

    }


    _winners(sites) {
        const maxPriority = sites.sort((b, a) => a.result.priority - b.result.priority)[0].result.priority;
        const tops = sites.filter(c => c.result.priority === maxPriority);
        const name = tops[0].result.name;
        logger.info('Winner', name)
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

        return record;
        //res.send({site, balance: {amount: site.player.balance}})
    }

    async getRecord(id) {
        return await Mongoose.poker.findOne({table: id}).populate(Mongoose.poker.population);
        /*const promise = new Promise((resolve, reject) => {
            Mongoose.poker.findById(id).populate(Mongoose.poker.population)
                .then(resolve).catch(reject)
        });
        const record = await promise;
        //record.extendLogic();
        return record;*/
    }


};

