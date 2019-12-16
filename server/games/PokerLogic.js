import Mongoose from "server/db/Mongoose";

const async = require("async");
const logger = require('logat');
const suits = ['S', 'C', 'D', 'H'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function _deck() {
    const d = [];
    for (const s of suits) {
        for (const v of values) {
            d.push(s + v)
        }
    }
    return d.sort(function () {
        return 0.5 - Math.random()
    });
}

export default {
    logicAttached: true,
    logicRounds: ['preflop', 'flop', 'turn', 'river'],
    logicOptions: [
        //{name: "defaultBet", type: "number", step:0.01, label: "Default bet", default:100},
        {name: "blind", type: "select", options: [{label: '1/2', value: 1}, {label: '5/10', value: 5}, {label: '10/20', value: 10}, {label: '100/200', value: 100},], label: "Blinds", default: 5},
        {name: "dices", type: "select", options: [2, 3, 4, 5], label: "Count of dices", default: 2},
        {name: "maxPlayers", type: "select", options: [2, 3, 4, 5], label: "Max players", default: 3},
        {name: "waitPlayer", type: "range", min: 30, max: 120, label: "Seconds to wait players turn", default: 45}
    ],

    logicHideOtherPlayers(player) {
        for (const site of this.sites) {
            if (!this.comparePlayers(player, site.player)) site.data.c1 = site.data.c2 = null;
        }
    },

    async logicTakeSite(player, siteId) {
        //this.players.push(player)
        const stake = this._logicGetDefaultStake();
        let site = this.sites.find(s => s._id.toString() === siteId);
        if (!site) site = this.sites[0];
        site.player = player;
        site.stake = stake;
        await site.save();
        player.addBalance(-stake);
        await player.save();
        if (this.sitesActive.length === 2) {
            await this._blindsBet()
        }
    },

    async _blindsBet() {
        logger.info('START POKER')
        //if (this.currentPot) return logger.warn('Current pot exists');
        if (this.sitesActive.length < 2) return logger.warn('Active sites < 2');
        this.pot.data = {deck: _deck()};
        for await (const site of this.sitesActive) {
            const c1 = this.pot.data.deck.pop();
            const c2 = this.pot.data.deck.pop();
            site.data = {c1, c2}
            await site.save()
        }

        this.sites[0].turn = true;
        await this.sites[0].save();
        await this.logicPlayerBet(this.options.blind, this.sitesActive[0].player);
        await this.logicPlayerBet(this.options.blind * 2, this.sitesActive[1].player);

    },

    async logicReturnBet(player) {
        const site = this.siteOfPlayer(player);
        const bet = this.betOfPlayer(player);
        site.data = null;
        site.turn = false;
        if (bet) {
            site.stake += bet.value;
            site.player.addBalance(bet.value);
            await site.player.save();
            await bet.delete();
        }
        await site.save()
    },

    async logicRemovePlayer(player) {
        await this.logicReturnBet(player);
        const site = this.siteOfPlayer(player);
        site.player.addBalance(site.stake);
        site.player = null;
        site.data = null;
        site.stake = 0;
        await site.save();
    },


    async logicPlayerBet(value, player) {
        logger.info("BET", value)
        const site = this.siteOfPlayer(player);
        const lastBet = this.betOfPlayer(player);
        if (lastBet && this.maxBet.value > lastBet.value + value) return false;
        site.stake -= value;
        site.turn = false;
        await Mongoose.Bet.create({site, round: this.round, value});
        await site.save();
        this.siteNextTurn.turn = true;
        await this.siteNextTurn.save();
        return true;
    },


    _logicGetDefaultStake() {
        return this.options.blind * 100;
    },

    logicCheckOptions(postBody) {
        const data = {};
        for (const option of this.logicOptions) {
            const value = postBody[option.name] || option.default;
            data[option.name] = value;
        }
        return data;
    },


}
