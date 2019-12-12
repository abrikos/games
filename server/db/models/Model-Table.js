import moment from "moment";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const modelSchema = new Schema({
        name: {type: String, required: [true, 'Name required']},
        game: {type: String, required: [true, 'Game required']},
        players: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
        maxPlayers: {type: Number, default: 2},
        activePlayer: {type: Number, default: 0},
        active: {type: Boolean, default: true}
    },
    {
        timestamps: {createdAt: 'createdAt'},
        //toObject: {virtuals: true},
        // use if your results might be retrieved as JSON
        // see http://stackoverflow.com/q/13133911/488666
        toJSON: {virtuals: true}
    });

modelSchema.methods.addPlayer = function (player) {
    this.players.push(player)
};

modelSchema.methods.removePlayer = function (player) {
    this.players.splice(this.players.indexOf(player),1)
};

modelSchema.virtual('canJoin')
    .get(function () {
        return this.maxPlayers > this.players.length;
    });


modelSchema.virtual('date')
    .get(function () {
        return moment(this.createdAt).format('YYYY-MM-DD HH:mm:ss')
    });

modelSchema.virtual('updated')
    .get(function () {
        return moment(this.updatedAt).format('YYYY-MM-DD HH:mm:ss')
    });

export default mongoose.model("Table", modelSchema)


