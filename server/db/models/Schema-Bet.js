const mongoose = require('mongoose');
const Schema = mongoose.Schema;

export default new Schema({
    value: {type: Number, default: 0},
    data: Object,
    site: mongoose.Schema.Types.ObjectId
}, {
    timestamps: {createdAt: 'createdAt'},
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
});
