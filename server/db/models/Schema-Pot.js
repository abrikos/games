import roundSchema from "./Schema-Round";
import cardSchema from "./Schema-Card";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const potSchema = new Schema({
    sites: [mongoose.Schema.Types.ObjectId],
    rounds: [roundSchema],

    deck: [cardSchema],
    closed: Boolean,
}, {
    timestamps: {createdAt: 'createdAt'},
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
});

potSchema.virtual('sum')
    .get(function () {
        let sum = 0;
        for (const bet of this.bets) {

            sum += bet.value;
        }
        return sum;
    });

potSchema.virtual('bets')
    .get(function () {
        let bets = [];
        for (const round of this.rounds) {
            bets = bets.concat(round.bets)
        }

        return bets;
    });

potSchema.virtual('lastRound')
    .get(function () {
        return this.rounds[this.rounds.length - 1];
    });

potSchema.virtual('round')
    .get(function () {
        return this.rounds[this.rounds.length - 1]
    });


export default potSchema
