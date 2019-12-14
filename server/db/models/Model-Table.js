import moment from "moment";
import * as Games from "server/games";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const logger = require('logat');

const MAX_PLAYERS = 3;
const WAIT_PLAYER = 45;

const roundSchema = new Schema({
        pot: {type: mongoose.Schema.Types.ObjectId, required: true},
        data: Object
    },
    {
        timestamps: {createdAt: 'createdAt'},
        toObject: {virtuals: true},
        toJSON: {virtuals: true}
    });

const potSchema = new Schema({
        sum: {type: Number, default: 0},
    },
    {
        timestamps: {createdAt: 'createdAt'},
        toObject: {virtuals: true},
        toJSON: {virtuals: true}
    });

const betSchema = new Schema({
        player: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
        round: {type: mongoose.Schema.Types.ObjectId, required: true},
        value: {type: Number, default: 0}
    },
    {
        timestamps: {createdAt: 'createdAt'},
        toObject: {virtuals: true},
        toJSON: {virtuals: true}
    });

const stakeSchema = new Schema({
    player: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    amount: {type: Number, default: 0}
});

const siteSchema = new Schema({
    player: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    amount: {type: Number, default: 0}
});


const modelSchema = new Schema({
        name: {type: String, required: [true, 'Name required']},
        game: {type: String, required: [true, 'Game required']},
        players: [{type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}],
        turn: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        sites: [{type: siteSchema}],
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


modelSchema.methods.nextPlayer = function (player) {
    let idx = this.players.map(p => p.user._id).indexOf(player);
    if (idx + 1 >= this.players.length) idx = -1;
    return this.players[idx + 1];
};

modelSchema.methods.createPot = function () {
    this.pots.push({sum: 0});
};

modelSchema.methods.removePlayer = function (player) {
    this.players.splice(this.players.map(p => p.user._id).indexOf(player), 1)
};

modelSchema.methods.comparePlayers = function (p1, p2) {
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

modelSchema.virtual('currentPotSum')
    .get(function () {
        return this.currentBets.length ? this.currentBets.reduce((a, b) => a.value + b.value) : 0;
    });

modelSchema.virtual('currentPot')
    .get(function () {
        let pot = this.pots[this.pots.length - 1];
        if (!pot) {
            pot = {sum: 0};
            this.pots.push(pot)
            pot = this.pots[0];
        }
        return pot;
    });

modelSchema.virtual('currentRound')
    .get(function () {
        return this.currentPotRounds[this.currentPotRounds.length - 1];
    });

modelSchema.virtual('currentPotRounds')
    .get(function () {
        let rounds = this.rounds.filter(r => r.pot === this.currentPot._id);
        if (!rounds.length) {
            this.rounds.push({pot: this.currentPot});
            rounds = this.rounds;
        }
        return rounds;
    });

modelSchema.virtual('currentBets')
    .get(function () {
        return this.bets.filter(r => r.round === this.currentRound.id);
    });


modelSchema.virtual('canJoin')
    .get(function () {
        return this.maxPlayers > this.players.length;
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


