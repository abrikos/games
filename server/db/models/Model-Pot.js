const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const logger = require('logat');


const modelSchema = new Schema({
    table: {type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true},
    sites: [{type: mongoose.Schema.Types.ObjectId, ref:'Site'}],
    data: Object,
    closed: Boolean
}, {
    timestamps: {createdAt: 'createdAt'},
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
});

modelSchema.virtual('bets')
    .get(function () {
        return this.pot.bets;
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


modelSchema.virtual('rounds', {
    ref: 'Round',
    localField: '_id',
    foreignField: 'pot',
    justOne: false // set true for one-to-one relationship
});

export default mongoose.model("Pot", modelSchema)


