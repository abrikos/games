import cardSchema from "./Schema-Card";
import betSchema from "./Schema-Bet";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

export default new Schema({
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
