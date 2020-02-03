import cardSchema from "./Schema-Card";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

export default new Schema({
    player: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    stake: {type: Number, default: 0},
    cards: [cardSchema],
    result: Object,
    blind: Number,
    combination: String,
    position: {type: Number, default: 0},
}, {
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
});
