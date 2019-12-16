const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const logger = require('logat');


const modelSchema = new Schema({
    pot: {type: mongoose.Schema.Types.ObjectId, ref:'Pot', required: true},
    data: Object,
    closed: Boolean
}, {
    timestamps: {createdAt: 'createdAt'},
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
});

modelSchema.virtual('bets', {
    ref: 'Bet',
    localField: '_id',
    foreignField: 'round',
    justOne: false // set true for one-to-one relationship
});

export default mongoose.model("Round", modelSchema)


