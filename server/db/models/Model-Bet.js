const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const logger = require('logat');


const modelSchema = new Schema({
    site: {type: mongoose.Schema.Types.ObjectId, ref:'Site', required: true},
    round: {type: mongoose.Schema.Types.ObjectId, ref:'Round',required: true},
    value: {type: Number, default: 0},
    data: Object
}, {
    timestamps: {createdAt: 'createdAt'},
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
});

export default mongoose.model("Bet", modelSchema)


