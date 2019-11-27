const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const modelSchema = new Schema({
        parent: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Parent required']},
        referral: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Referral required']},
    },
    {
        timestamps: {createdAt: 'createdAt'},
        //toObject: {virtuals: true},
        // use if your results might be retrieved as JSON
        // see http://stackoverflow.com/q/13133911/488666
        //toJSON: {virtuals: true}
    });



const Referral = mongoose.model("Referral", modelSchema)
export default Referral;

