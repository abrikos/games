const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const logger = require('logat');


const modelSchema = new Schema({
    table: {type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true},
    player: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    stake: {type: Number, default: 0},
    data: Object
}, {
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
});

export default mongoose.model("Site", modelSchema)


