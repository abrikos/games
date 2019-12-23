import cardSchema from "./Model-Card";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const logger = require('logat');


const betSchema = new Schema({
    value: {type: Number, default: 0},
    data: Object,
    site: mongoose.Schema.Types.ObjectId
}, {
    timestamps: {createdAt: 'createdAt'},
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
});

const roundSchema = new Schema({
    poker:{type:mongoose.Schema.Types.ObjectId, ref:'Poker'},
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


const modelSchema = new Schema({
    sites: [{type:mongoose.Schema.Types.ObjectId, ref:'Site'}],
    rounds: [roundSchema],

    deck: [cardSchema],
    closed: Boolean,
}, {
    timestamps: {createdAt: 'createdAt'},
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
});

modelSchema.virtual('sum')
    .get(function () {
        if(!this.bets.length) return 0;
        return this.bets.reduce((a, b) => a.value + b.value);
    });

modelSchema.virtual('round')
    .get(function () {
        return this.rounds.find(r=>!r.closed);
    });


export default mongoose.model("Pot", modelSchema)


