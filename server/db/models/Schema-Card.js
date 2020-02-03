const mongoose = require('mongoose');
const Schema = mongoose.Schema;

export default new Schema({suit:String, value:String, idx: Number});
