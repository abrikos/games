const logger = require('logat');
const suits = ['S', 'C', 'D', 'H'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function deck() {
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

     logicAddPlayer(player, siteId) {
        //this.players.push(player)
        const stake = this.logicGetDefaultStake();
        let site = this.sites.find(s=>s.id === siteId);
        if(!site) site = this.sites[0];
        site.player = player;
        site.stake = stake;
        //site.save()
        player.addBalance(-stake);
        player.save();
        //this.logicStartupBet(player);
        //this.logicSetTurn(player)
        if (this.sitesActive.length === 2) {
            this.logicPotStart()
        }
    },

    logicPotStart() {
        if (this.currentPot) return logger.warn('Current pot exists');
        if (this.sitesActive.length < 2) return  logger.warn('Active sites < 2');
        this.currentPot.data = {deck: deck()};
        for (const site of this.sites) {
            const c1 = this.currentPot.data.deck.pop();
            const c2 = this.currentPot.data.deck.pop();
            site.data = {c1, c2}
            //site.save()
        }
        if (this.sitesActive.length === 2) {
            this.currentRound.siteTurn = this.sites[0];
            this.logicBet(this.options.blind, this.sites[0].player);
            this.logicBet(this.options.blind * 2, this.sites[1].player);
        } else if(this.sitesActive.length>2){
            this.currentRound.siteTurn = this.sites[2]
        }
    },

    logicPotFinish() {
        this.currentPot.closed = true;
    },


    logicBet(value, player) {
        const site = this.sitePlayer(player)
        site.amount -= value;
        this.bets.push({player, round: this.currentRound, value});
        this.logicSetTurn(player)
    },

    logicGetDefaultStake() {
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
