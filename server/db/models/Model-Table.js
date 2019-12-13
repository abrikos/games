import moment from "moment";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const logger = require('logat');

const roundSchema = new Schema({
        start: {type: Date, required: true},
        end: {type: Date},
        active: {type: Boolean, default: true},
        bank: {type: Number, default: 0},
        data: Object
    },
    {
        timestamps: {createdAt: 'createdAt'},
        toObject: {virtuals: true},
        // use if your results might be retrieved as JSON
        // see http://stackoverflow.com/q/13133911/488666
        toJSON: {virtuals: true}
    });

const turnSchema = new Schema({
        player: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
        round: {type: mongoose.Schema.Types.ObjectId, required: true},
        data: {type: Object, required: true},
        lastInRound: {type: Boolean, default: false},
    },
    {
        timestamps: {createdAt: 'createdAt'},
        toObject: {virtuals: true},
        // use if your results might be retrieved as JSON
        // see http://stackoverflow.com/q/13133911/488666
        toJSON: {virtuals: true}
    });

const modelSchema = new Schema({
        name: {type: String, required: [true, 'Name required']},
        game: {type: String, required: [true, 'Game required']},
        players: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
        turn: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        rounds: [{type: roundSchema}],
        turns: [{type: turnSchema}],

        isVirtual: {type: Boolean, default: true},
        options: {type: Object},
        maxPlayers: {type: Number, default: 2},
        waitPlayer: {type: Number, default: 45},
        activePlayer: {type: Number, default: 0},
        active: {type: Boolean, default: true}
    },
    {
        timestamps: {createdAt: 'createdAt'},
        toObject: {virtuals: true},
        // use if your results might be retrieved as JSON
        // see http://stackoverflow.com/q/13133911/488666
        toJSON: {virtuals: true}
    });

modelSchema.methods.addRound = function () {
    this.rounds.push({start: new Date()});
};

modelSchema.methods.newTurn = function (player) {
    const turn = {round: this.lastRound._id, player}
    return turn;
};

modelSchema.methods.addPlayer = function (player) {
    this.players.push(player)
};

modelSchema.methods.nextTurn = function (player) {
    let idx = this.players.map(p => p._id).indexOf(player);
    if (idx + 1 >= this.players.length) idx = -1;
    return this.players[idx + 1];
};

modelSchema.methods.removePlayer = function (player) {
    this.players.splice(this.players.indexOf(player), 1)
};

modelSchema.virtual('canJoin')
    .get(function () {
        return this.maxPlayers > this.players.length;
    });

modelSchema.virtual('lastRound')
    .get(function () {
        return this.rounds[this.rounds.length - 1]
    });

modelSchema.virtual('roundTurns')
    .get(function () {
        return this.turns.filter(t => t.round.toString() === this.lastRound._id.toString());
    });

modelSchema.virtual('prevTurn')
    .get(function () {
        return this.roundTurns[this.roundTurns.length - 1]
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


