import moment from "moment";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const modelSchema = new Schema({
        id: {type: Number, unique: true},
        first_name: String,
        username: String,
        photo_url: String,
        language_code: String,
        referrals: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
        group: {type: mongoose.Schema.Types.ObjectId, ref: 'Group'},
    },
    {
        timestamps: {createdAt: 'createdAt'},
        //toObject: {virtuals: true},
        // use if your results might be retrieved as JSON
        // see http://stackoverflow.com/q/13133911/488666
        toJSON: {virtuals: true}
    });

modelSchema.virtual('name')
    .get(function () {
        return this.first_name;
    });

modelSchema.virtual('date')
    .get(function () {
        return moment(this.createdAt).format('YYYY-MM-DD HH:mm:ss')
    });



modelSchema.virtual('parents', {
    ref: 'User',
    localField: '_id',
    foreignField: 'referrals',
    justOne: false // set true for one-to-one relationship
});

modelSchema.virtual('groups', {
    ref: 'Group',
    localField: '_id',
    foreignField: 'owner',
    justOne: false // set true for one-to-one relationship
});


const User = mongoose.model("User", modelSchema)
export default User;

