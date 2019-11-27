import moment from "moment";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const modelSchema = new Schema({
        field: {type: Object, required: true},
        lastCell: {type: Number, default:0},

        player: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Player required']},
        opponent: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        turn: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    },
    {
        timestamps: {createdAt: 'createdAt'},
        toObject: {virtuals: true},
        // use if your results might be retrieved as JSON
        // see http://stackoverflow.com/q/13133911/488666
        toJSON: {virtuals: true}
    });


modelSchema.virtual('link')
    .get(function () {
        return `${process.env.SITE}/filler/${this.id}`
    });

modelSchema.virtual('date')
    .get(function () {
        return moment(this.createdAt).format('YYYY-MM-DD HH:mm:ss')
    });

modelSchema.virtual('updated')
    .get(function () {
        return moment(this.updatedAt).format('YYYY-MM-DD HH:mm:ss')
    });



const Filler = mongoose.model("Filler", modelSchema);
export default Filler

