import moment from "moment";
import Poker from "server/games/poker/Poker";
//import siteSchema from "./Schema-Site";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const logger = require('logat');
const MAX_PLAYERS = 3;
const WAIT_PLAYER = 45;



const siteSchema = new Schema({
    player: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    stake: {type: Number, default: 0},
    position: {type: Number, default: 0},
    firstTurn: Boolean,
    currentTurn: Boolean,
    result: Object,
}, {
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
});


const modelSchema = new Schema({
        name: {type: String, required: [true, 'Name required']},
        game: {type: String, required: [true, 'Game required']},
        options: {type: Object, default:{}},
        sites: [siteSchema],
        realMode: {type: Boolean},
        active: {type: Boolean, default: true},
    },
    {
        timestamps: {createdAt: 'createdAt'},
        //toObject: {virtuals: true},
        // use if your results might be retrieved as JSON
        // see http://stackoverflow.com/q/13133911/488666
        toJSON: {virtuals: true}
    });

modelSchema.statics.population = ['sites.player'];

modelSchema.methods.nextSite = function (site) {
    if(typeof site != 'object') site = this.sites.id(site);
    return this.sites.find(s => s.player && s.position === (site.position === this.sites.length - 1 ? 0 : site.position + 1));
};

modelSchema.methods.siteOfPlayer = function (player) {
    const site = this.sites.find(s => s.player && s.player.equals(player));

    if (this.potLast)
        site.result = Poker.combination(site.cards, this.potLast.round.cards)
    return site;

};

modelSchema.virtual('turnSite')
    .get(function () {
        return this.sites.find(s=>s.currentTurn);
    });


modelSchema.virtual('canJoin')
    .get(function () {
        return this.maxPlayers > this.sitesActive.length;
    });


modelSchema.virtual('maxPlayers')
    .get(function () {
        return this.options.maxPlayers || MAX_PLAYERS
    });

modelSchema.virtual('waitPlayer')
    .get(function () {
        return this.options.waitPlayer || WAIT_PLAYER
    });

modelSchema.virtual('playersCount')
    .get(function () {
        return this.sites.filter(s => !!s.player).length;
    });



modelSchema.methods.takeSite = function ({player, siteId, stake}) {
    if (!this.sites.find(s => !s.player)) return logger.warn('No sites available');
    //const stake = record.options.blind * 100;
    let site = this.sites.find(s => s.equals(siteId));
    if (!site) {
        site = this.sites.find(s => !s.player);
    }
    site.player = player;
    site.stake = stake;
    player.addBalance(-stake);
};

modelSchema.virtual('sitesActive')
    .get(function () {
        return this.sites.filter(s => s.player);
    });


modelSchema.virtual('date')
    .get(function () {
        return moment(this.createdAt).format('YYYY-MM-DD HH:mm:ss')
    });



modelSchema.virtual('poker', {
    ref: 'Poker',
    match:()=>{return {active:true}},
    localField: '_id',
    foreignField: 'table',
    justOne: true // set true for one-to-one relationship
});


export default mongoose.model("Table", modelSchema)


