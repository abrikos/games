const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const logger = require('logat');


const modelSchema = new Schema({
    table: {type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true},
    player: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    stake: {type: Number, default: 0},
    data: Object,
    position: {type: Number, default: 0},
}, {
    timestamps: {createdAt: 'createdAt'},
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
});

modelSchema.virtual('bets', {
    ref: 'Bet',
    localField: '_id',
    foreignField: 'site',
    justOne: false // set true for one-to-one relationship
});


export default mongoose.model("Site", modelSchema)


