import moment from "moment";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const logger = require('logat');

const MAX_PLAYERS = 3;
const WAIT_PLAYER = 45;


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
    cards: [String],
    position: {type: Number, default: 0},
}, {
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
});


const roundSchema = new Schema({
    turn: mongoose.Schema.Types.ObjectId,
    type: String,
    cards: [String],
    closed: Boolean
}, {
    timestamps: {createdAt: 'createdAt'},
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
});

const potSchema = new Schema({
    sites: [mongoose.Schema.Types.ObjectId],
    rounds: [roundSchema],
    bets: [betSchema],
    deck: [String],
    closed: Boolean
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

modelSchema.methods.betOfPlayer = function (player) {
    return this.betsOfPlayer(player);
};

modelSchema.methods.betsOfPlayer = function (player) {
    if (!this.pot || !this.pot.bets) return [];
    const site = this.siteOfPlayer(player);
    return this.pot.bets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).filter(b => b.site.equals(site._id))
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
        if (!this.playerSite) return 0;
        const bets = this.betsOfPlayer(this.playerSite.player).map(item => item.value);
        if(!bets.length) return 0;
        return bets.reduce((a, b) => a + b);

    });

modelSchema.virtual('sitesBets')
    .get(function () {
        if (!this.bets) return [];
        const bets = {};
        for (const bet of this.bets) {
            if(!bets[bet.site]) bets[bet.site] = 0;
            bets[bet.site] += bet.value
        }
        return Object.keys(bets).map(site=>{return {site, sum:bets[site]}})
    });

modelSchema.virtual('maxBet')
    .get(function () {
        if (!this.bets) return 0;
        return Math.max(...this.sitesBets.map(s=>s.sum));
    });

modelSchema.virtual('bets')
    .get(function () {
        if(!this.pot) return [];
        return this.pot.bets;
    });

modelSchema.virtual('turnSite')
    .get(function () {
        return this.sites.id(this.round.turn);
    });

modelSchema.virtual('isMyTurn')
    .get(function () {
        return this.playerSite && this.playerSite.equals(this.round.turn)  && this.mySumBets;
    });


modelSchema.virtual('potSum')
    .get(function () {
        if (!this.pot || !this.pot.bets) return [];
        let sum = 0;
        for (const bet of this.pot.bets) {
            sum += bet.value;
        }
        return sum;
    });


modelSchema.virtual('pot')
    .get(function () {
        return this.pots.find(p => !p.closed);
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


