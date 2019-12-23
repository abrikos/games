import cardSchema from "./Model-Card";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const logger = require('logat');



const modelSchema = new Schema({
    poker:{type:mongoose.Schema.Types.ObjectId, ref:'Poker'},
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



export default mongoose.model("Site", modelSchema)


