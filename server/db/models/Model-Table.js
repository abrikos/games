import moment from "moment";
import * as Games from "server/games";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const logger = require('logat');

const MAX_PLAYERS = 3;
const WAIT_PLAYER = 45;

const roundSchema = new Schema({
        pot: {type: mongoose.Schema.Types.ObjectId, required: true},
        siteTurn: {type: mongoose.Schema.Types.ObjectId},
        data: Object,
        closed: Boolean
    },
    {
        timestamps: {createdAt: 'createdAt'},
    });

const potSchema = new Schema({
        sum: {type: Number, default: 0},
        data: Object,
        closed: Boolean
    },
    {
        timestamps: {createdAt: 'createdAt'},
    });

const betSchema = new Schema({
        //player: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
        site: {type: mongoose.Schema.Types.ObjectId, required: true},
        round: {type: mongoose.Schema.Types.ObjectId, required: true},
        value: {type: Number, default: 0},
        data: Object
    },
    {
        timestamps: {createdAt: 'createdAt'},
    });


const siteSchema = new Schema({
        player: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        stake: {type: Number, default: 0},
        position: {type: Number, default: 0},
        turn: {type: Boolean, default: false},
        data: Object
    },
    {
        timestamps: {createdAt: 'createdAt'},
    });


const modelSchema = new Schema({
        name: {type: String, required: [true, 'Name required']},
        game: {type: String, required: [true, 'Game required']},
        //players: [{type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}],
        //turn: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        //sites: [{type: mongoose.Schema.Types.ObjectId, ref: 'Site'}],
        sites: [{type: siteSchema}],
        playerSite: {type: siteSchema},
        pots: [{type: potSchema}],
        rounds: [{type: roundSchema}],
        bets: [{type: betSchema}],

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
    'sites.player',
    //'playerSite.player'
];

modelSchema.methods.createPot = function () {
    this.pots.push({sum: 0});
};

modelSchema.methods.closePot = function () {
    this.currentPot.closed = true;
};

modelSchema.methods.removePlayer = function (player) {
    const site = this.siteOfPlayer(player);
    site.player.addBalance(site.stake);
    site.player.save();
    site.player = null;
    site.data = null;
    site.stake = 0;
};

modelSchema.methods.siteOfPlayer = function (player) {
    const site = this.sites.find(s => this.comparePlayers(s.player, player));
    if (!site) return null;
    return site;
};

modelSchema.methods.betOfPlayer = function (player) {
    const site = this.siteOfPlayer(player)
    return this.currentBets.find(b => b.site.equals(site._id));

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

modelSchema.virtual('currentTurnSite')
    .get(function () {
        return this.sites.find(s => s.turn);
    });

modelSchema.virtual('nextTurnSite')
    .get(function () {
        if (!this.currentTurnSite || this.currentTurnSite.position + 1 >= this.sites.length) return this.sites[0];
        return this.sites[this.currentTurnSite + 1];

    });

modelSchema.virtual('playerBet')
    .get(function () {
        if (!this.playerSite) return null;
        return this.betOfPlayer(this.playerSite.player);
    });

modelSchema.virtual('maxBet')
    .get(function () {
        let max = { value:0};
        for(const bet of this.currentBets){
            if(bet.value> max.value) max = bet;
        }
        return max;
    });

modelSchema.virtual('currentBets')
    .get(function () {
        if(!this.currentRound) return[];
        return  this.bets.filter(r =>r.round.equals(this.currentRound._id));
    });


modelSchema.virtual('currentPotSum')
    .get(function () {
        return this.currentBets.length ? this.currentBets.reduce((a, b) => a.value + b.value) : 0;
    });

modelSchema.methods.newPot = function () {
    this.pots.push({sum: 0})
};

modelSchema.virtual('currentPot')
    .get(function () {

        return this.pots.find(p => !p.closed);
    });

modelSchema.virtual('currentRound')
    .get(function () {
        return this.currentPotRounds.find(p => !p.closed)
    });

modelSchema.virtual('currentPotRounds')
    .get(function () {
        if(!this.currentPot) return [];
        let rounds = this.rounds.filter(r => r.pot.equals(this.currentPot._id));

        if (!rounds.length) {
            this.rounds.push({pot: this.currentPot});
            rounds = this.rounds;
        }
        return rounds;
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

export default mongoose.model("Table", modelSchema)


