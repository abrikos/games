import moment from "moment";
//import siteSchema from "./Schema-Site";
import potSchema from "./Schema-Pot";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const logger = require('logat');

const OPTIONS = [
    //{name: "defaultBet", type: "number", step:0.01, label: "Default bet", default:100},
    {name: "blind", type: "select", options: [{label: '1/2', value: 1}, {label: '5/10', value: 5}, {label: '10/20', value: 10}, {label: '100/200', value: 100},], label: "Blinds", default: 5},
    {name: "maxPlayers", type: "select", options: [2, 3, 4, 5], label: "Max players", default: 3},
    {name: "waitPlayer", type: "range", min: 30, max: 120, label: "Seconds to wait players turn", default: 45}
];

const DATA = {
    cards: [],
    blind: 0,
    combination: '',
    fold: false,
}

const modelSchema = new Schema({
        //name: {type: String, required: [true, 'Name required']},
        //game: {type: String, required: [true, 'Game required']},
        //players: [{type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}],
        //turn: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        //sites: [siteSchema],
        pots: [potSchema],
        playerSite: Object,
        //realMode: {type: Boolean},
        activePlayer: {type: Number, default: 0},
        active: {type: Boolean, default: true},
        table: {type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: [true, 'Table required']},
    },
    {
        timestamps: {createdAt: 'createdAt'},
        toObject: {virtuals: true},
        toJSON: {virtuals: true}
    });



modelSchema.statics.population = [{
    path: 'table',
    populate: 'sites.player'
},];


modelSchema.methods.cardsOfPlayer = function (player) {
    if(!player) return [];
    const site = this.table.siteOfPlayer(player);
    const potSite = this.pot.sites.find(s=>s.tableSite.equals(site.id));
    return potSite.cards;
};


modelSchema.methods.playerSumBet = function (player) {
    const bets = this.betsOfPlayer(player);
    if (!bets.length) return 0;
    return bets.map(b => b.value).reduce((a, b) => a + b);
};

modelSchema.methods.betsOfPlayer = function (player) {
    //if (!this.pot || !this.potBets) return [];
    const site = this.table.siteOfPlayer(player);
    if (!site) return [];
    if (!this.pot) return [];
    return this.pot.round.bets.filter(b => b.site.equals(site._id));
    //return this.potBets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).filter(b => b.site.equals(site._id))
};

/*
modelSchema.methods.extendLogic = function () {
    const game = Games[this.game];
    for (const key of Object.keys(game)) {
        this[key] = game[key];
    }
};
*/

/*
modelSchema.virtual('playerSite')
    .set(function (id) {
        this.playerSiteId = id;
    })
    .get(function () {
        return this.pot.sites.find(s=>s.siteId.equals(this.playerSiteId))
    });
*/


modelSchema.virtual('initialStake')
    .get(function () {
        return this.table.options.blind * 100;
    });

modelSchema.virtual('defaultOptions')
    .get(function () {
        return OPTIONS
    });

modelSchema.virtual('gameData')
    .get(function () {
        return DATA
    });

modelSchema.statics.defaultOptions = OPTIONS;

modelSchema.virtual('sitesOfPot')
    .get(function () {
        if (!this.pot) return [];
        return this.pot.sites;
    });

modelSchema.virtual('sitesCanBet')
    .get(function () {
        if (!this.pot) return [];
        return this.table.sites.filter(s=>!s.data.fold);
    });


modelSchema.virtual('mySumBets')
    .get(function () {
        if (!this.playerSite) return 0;
        const bets = this.betsOfPlayer(this.playerSite.player).map(item => item.value);

        if (!bets.length) return 0;
        return bets.reduce((a, b) => a + b);

    });

modelSchema.virtual('sitesBetSum')
    .get(function () {

        if (!this.pot) return [];
        if (!this.pot.round.bets) return [];
        const bets = {};
        for (const bet of this.pot.round.bets) {
            if (!bets[bet.site]) bets[bet.site] = 0;
            bets[bet.site] += bet.value
        }
        return Object.keys(bets).map(site => {
            return {site, sum: bets[site]}
        })
    });

modelSchema.virtual('maxBet')
    .get(function () {
        if (!this.pot) return 0;
        if (!this.pot.round.bets) return 0;
        let max = 0;

        for (const site of this.sitesBetSum) {
            if (site.sum > max) max = site.sum;
        }
        return max;
    });


modelSchema.virtual('turnSite')
    .get(function () {
        if (!this.pot) return this.table.sitesActive[0];
        return this.table.sites.id(this.pot.round.turn);
    });

modelSchema.virtual('ftrCards')
    .get(function () {
        if (!this.potLast) return [];
        return this.potLast.lastRound.cards;
    });

modelSchema.virtual('isMyTurn')
    .get(function () {
        if (!this.pot) return false;
        return this.playerSite && this.playerSite.equals(this.pot.round.turn);
    });


modelSchema.virtual('bank')
    .get(function () {
        let sum = 0;
        for (const pot of this.pots) {
            sum += pot.sum;
        }
        return sum;
    });

modelSchema.virtual('potPrev')
    .get(function () {
        const closed = this.pots.filter(p => p.closed);
        return closed[closed.length - 1];
    });

modelSchema.virtual('pot')
    .get(function () {
        return this.potsOpen[this.potsOpen.length - 1];
    });

modelSchema.virtual('potsOpen')
    .get(function () {
        return this.pots.filter(p => !p.closed);
    });

modelSchema.virtual('potLast')
    .get(function () {
        return this.pots[this.pots.length - 1];
    });


modelSchema.virtual('nextTurn')
    .get(function () {

        if (!this.pot) return;
        let idx = this.sitesOfPot.map(s => s.toString()).indexOf(this.pot.round.turn.toString()) + 1;
        if (idx === this.sitesOfPot.length) idx = 0;
        return this.sitesOfPot[idx].tableSite;
    });

/*
modelSchema.virtual('round')
    .get(function () {
        return this.pot.round
    });

modelSchema.virtual('rounds')
    .get(function () {
        return this.pot ? this.pot.rounds : [];
        /!*if (!this.currentPot) return [];
        let rounds = this.rounds.filter(r => r.pot.equals(this.currentPot._id));

        if (!rounds.length) {
            this.rounds.push({pot: this.currentPot});
            rounds = this.rounds;
        }
        return rounds;*!/
    });
*/


modelSchema.virtual('lastBet')
    .get(function () {
        if (!this.pot) return;
        if (!this.pot.round || !this.pot.round.bets) return null;
        return this.pot.round.bets[this.pot.round.bets.length - 1];
    });


modelSchema.virtual('date')
    .get(function () {
        return moment(this.createdAt).format('YYYY-MM-DD HH:mm:ss')
    });

modelSchema.virtual('updated')
    .get(function () {
        return moment(this.updatedAt).format('YYYY-MM-DD HH:mm:ss')
    });

/*
modelSchema.virtual('sites', {
    ref: 'Site',
    localField: '_id',
    foreignField: 'table',
    justOne: false // set true for one-to-one relationship
});

modelSchema.virtual('pots', {
    ref: 'Pot',
    localField: '_id',
    foreignField: 'table',
    justOne: false // set true for one-to-one relationship
});
*/


export default mongoose.model("Poker", modelSchema)


