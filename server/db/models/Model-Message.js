import moment from "moment";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const modelSchema = new Schema({
        text: {type: String, required: true},
        delivered:{type:Boolean, default:false},
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'User required']},
    },
    {
        timestamps: {createdAt: 'createdAt'},
        toObject: {virtuals: true},
        // use if your results might be retrieved as JSON
        // see http://stackoverflow.com/q/13133911/488666
        toJSON: {virtuals: true}
    });


modelSchema.virtual('date')
    .get(function () {
        return moment(this.createdAt).format('YYYY-MM-DD HH:mm:ss')
    });

modelSchema.virtual('updated')
    .get(function () {
        return moment(this.updatedAt).format('YYYY-MM-DD HH:mm:ss')
    });



const Message = mongoose.model("Message", modelSchema);
export default Message

