import moment from "moment";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const modelSchema = new Schema({
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        table: {type: mongoose.Schema.Types.ObjectId, ref: 'Table'},
        amount: {type: Number, required: true},
        text: {type: String},

    },
    {
        timestamps: {createdAt: 'createdAt'},
        //toObject: {virtuals: true},
        // use if your results might be retrieved as JSON
        // see http://stackoverflow.com/q/13133911/488666
        toJSON: {virtuals: true}
    });

modelSchema.virtual('date')
    .get(function () {
        return moment(this.createdAt).format('YYYY-MM-DD HH:mm:ss')
    });



export default mongoose.model("Log", modelSchema)


