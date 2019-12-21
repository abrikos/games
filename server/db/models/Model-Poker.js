import moment from "moment";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const logger = require('logat');

const MAX_PLAYERS = 3;
const WAIT_PLAYER = 45;

const cardSchema = new Schema({suit:String, value:String, idx: Number});

const betSchema = new Schema({
    value: {type: Number, default: 0},
    data: Object,
    site: mongoose.Schema.Types.ObjectId
}, {
    timestamps: {createdAt: 'createdAt'},
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
});

const siteSchema = new Schema({
    player: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    stake: {type: Number, default: 0},
    cards: [cardSchema],
    result: Object,
    blind: Number,
    position: {type: Number, default: 0},
}, {
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
});


const roundSchema = new Schema({
    bets: [betSchema],
    turn: mongoose.Schema.Types.ObjectId,
    type: String,
    cards: [cardSchema],
    closed: Boolean
}, {
    timestamps: {createdAt: 'createdAt'},
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
});



const potSchema = new Schema({
    sites: [mongoose.Schema.Types.ObjectId],
    rounds: [roundSchema],

    deck: [cardSchema],
    closed: Boolean,
    active: {type:Boolean, default: true}
}, {
    timestamps: {createdAt: 'createdAt'},
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
});


const modelSchema = new Schema({
        name: {type: String, required: [true, 'Name required']},
        //game: {type: String, required: [true, 'Game required']},
        //players: [{type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}],
        //turn: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        sites: [siteSchema],
        pots: [potSchema],
        playerSite: siteSchema,
        realMode: {type: Boolean},
        options: {type: Object},
        activePlayer: {type: Number, default: 0},
        active: {type: Boolean, default: true}
    },
    {
        timestamps: {createdAt: 'createdAt'},
        toObject: {virtuals: true},
        toJSON: {virtuals: true}
    });


modelSchema.statics.population = ['sites.player'];
modelSchema.statics.populationBak = [
    {path: 'sites', populate: 'player'},
    {path: 'pots', populate: [{path: 'rounds', populate: {path: 'bets', populate: 'site'}}]},

];


modelSchema.methods.siteOfPlayer = function (player) {
    return this.sites.find(s => this.comparePlayers(s.player, player));
};

modelSchema.methods.playerSumBet = function (player) {
    const bets = this.betsOfPlayer(player);
    if(!bets.length) return 0;
    return bets.map(b => b.value).reduce((a, b) => a + b);
};

modelSchema.methods.betsOfPlayer = function (player) {
    if (!this.pot || !this.potBets) return [];
    const site = this.siteOfPlayer(player);
    return this.round.bets.filter(b => b.site.equals(site._id));
    //return this.potBets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).filter(b => b.site.equals(site._id))
};

modelSchema.methods.comparePlayers = function (p1, p2) {
    if (!p1 || !p2) return false;
    const id1 = p1._id || p1;
    const id2 = p2._id || p2;
    return id1.toString() === id2.toString()
};

/*
modelSchema.methods.extendLogic = function () {
    const game = Games[this.game];
    for (const key of Object.keys(game)) {
        this[key] = game[key];
    }
};
*/

modelSchema.virtual('sitesNotFold')
    .get(function () {
        return this.sitesActive.filter(s => !s.fold)
    });


modelSchema.virtual('maxPlayers')
    .get(function () {
        return this.options.maxPlayers || MAX_PLAYERS
    });

modelSchema.virtual('waitPlayer')
    .get(function () {
        return this.options.waitPlayer || WAIT_PLAYER
    });


modelSchema.virtual('sitesOfPot')
    .get(function () {
        if (!this.pot) return [];
        return this.pot.sites;
    });

modelSchema.virtual('mySumBets')
    .get(function () {
        if (!this.playerSite || !this.round || !this.round.bets) return 0;
        const bets = this.betsOfPlayer(this.playerSite.player).map(item => item.value)
        if (!bets.length) return 0;
        return bets.reduce((a, b) => a + b);

    });

modelSchema.virtual('sitesBetSum')
    .get(function () {
        if (!this.round.bets) return [];
        const bets = {};
        for (const bet of this.round.bets) {
            if (!bets[bet.site]) bets[bet.site] = 0;
            bets[bet.site] += bet.value
        }
        return Object.keys(bets).map(site => {
            return {site, sum: bets[site]}
        })
    });

modelSchema.virtual('maxBet')
    .get(function () {
        if (!this.round.bets) return 0;
        let max = 0;
        for (const site of this.sitesBetSum) {
            if (site.sum > max) max = site.sum;
        }
        return max;
    });


modelSchema.virtual('turnSite')
    .get(function () {
        return this.sites.id(this.round.turn);
    });

modelSchema.virtual('ftrCards')
    .get(function () {
        let cards = [];
        for(const round of this.rounds){
            cards = cards.concat(round.cards)
        }
        return cards;
    });

modelSchema.virtual('isMyTurn')
    .get(function () {
        return this.playerSite && this.playerSite.equals(this.round.turn);
    });


modelSchema.virtual('potSum')
    .get(function () {

        if (!this.pot || !this.potBets) return [];
        let sum = 0;
        for (const bet of this.potBets) {
            sum += bet.value;
        }
        return sum;
    });

modelSchema.virtual('potBets')
    .get(function () {
        let bets = [];
        for (const round of this.rounds) {
            bets = bets.concat(round.bets)
        }

        return bets;
    });


modelSchema.virtual('pot')
    .get(function () {
        return this.pots.find(p => p.active);
    });

modelSchema.virtual('potsOpen')
    .get(function () {
        return this.pots.filter(p => !p.closed);
    });

modelSchema.virtual('round')
    .get(function () {
        if (!this.pot) return [];
        return this.pot.rounds[this.pot.rounds.length - 1]
    });

modelSchema.virtual('rounds')
    .get(function () {
        return this.pot ? this.pot.rounds : [];
        /*if (!this.currentPot) return [];
        let rounds = this.rounds.filter(r => r.pot.equals(this.currentPot._id));

        if (!rounds.length) {
            this.rounds.push({pot: this.currentPot});
            rounds = this.rounds;
        }
        return rounds;*/
    });


modelSchema.virtual('sitesActive')
    .get(function () {
        return this.sites.filter(s => s.player);
    });

modelSchema.virtual('lastBet')
    .get(function () {
        if (!this.round || !this.round.bets) return null;
        return this.round.bets[this.round.bets.length - 1];
    });


modelSchema.virtual('canJoin')
    .get(function () {
        return this.maxPlayers > this.sitesActive.length;
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


