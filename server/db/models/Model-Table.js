import moment from "moment";
import * as Games from "server/games";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const logger = require('logat');

const MAX_PLAYERS = 3;
const WAIT_PLAYER = 45;


const modelSchema = new Schema({
        name: {type: String, required: [true, 'Name required']},
        game: {type: String, required: [true, 'Game required']},
        //players: [{type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}],
        //turn: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        //sites: [{type: mongoose.Schema.Types.ObjectId, ref: 'Site'}],
        playerSite: {type: mongoose.Schema.Types.ObjectId, ref:'Site'},
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


modelSchema.statics.population = [
    {path: 'sites', populate: 'player'},
    {path: 'pots', populate: [{path: 'rounds', populate: {path: 'bets', populate: 'site'}}]},

];



modelSchema.methods.siteOfPlayer = function (player) {
    return this.sites.find(s => this.comparePlayers(s.player, player));
};

modelSchema.methods.betOfPlayer = function (player) {
    if(!this.bets) return null;
    const site = this.siteOfPlayer(player);
    return this.bets.find(b => b.site.equals(site._id));

};

modelSchema.methods.comparePlayers = function (p1, p2) {
    if (!p1 || !p2) return false;
    const id1 = p1._id || p1;
    const id2 = p2._id || p2;
    return id1.toString() === id2.toString()
};

modelSchema.methods.extendLogic = function () {
    const game = Games[this.game];
    for (const key of Object.keys(game)) {
        this[key] = game[key];
    }
};

modelSchema.virtual('maxPlayers')
    .get(function () {
        return this.options.maxPlayers || MAX_PLAYERS
    });

modelSchema.virtual('waitPlayer')
    .get(function () {
        return this.options.waitPlayer || WAIT_PLAYER
    });


modelSchema.virtual('siteNextTurn')
    .get(function () {
        if (!this.siteTurn || this.siteTurn.position + 1 >= this.sitesActive.length) return this.sitesActive[0];
        return this.sitesActive[this.siteTurn.position + 1];

    });

modelSchema.virtual('siteTurn')
    .get(function () {
        return this.sites.find(s => s.turn);
    });


modelSchema.virtual('playerBet')
    .get(function () {
        if (!this.playerSite) return null;
        return this.betOfPlayer(this.playerSite.player);
    });

modelSchema.virtual('maxBet')
    .get(function () {
        if(!this.bets) return 0;
        let max = {value: 0};
        for (const bet of this.bets) {
            if (bet.value > max.value) max = bet;
        }
        return max;
    });

modelSchema.virtual('bets')
    .get(function () {
        return this.pot.bets;
    });


modelSchema.virtual('potSum')
    .get(function () {
        return this.pot.sum;

    });


modelSchema.virtual('pot')
    .get(function () {
        return this.pots.find(p => !p.closed);
    });

modelSchema.virtual('round')
    .get(function () {
        return this.pot.round
    });

modelSchema.virtual('rounds')
    .get(function () {
        return this.pot.rounds;
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


export default mongoose.model("Table", modelSchema)


