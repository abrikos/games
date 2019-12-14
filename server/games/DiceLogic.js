const logger = require('logat');
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

    logicOnPlayerJoin(table) {

    },

    logicSetTurn(player) {
        if (this.players.length === 2) {
            //SMALL BLIND
            this.turn = this.players[0];
        }else {

        }
    },

    logicPayWinners(table) {
        for (const winner of this.getRoundWinners(table)) {
            winner.addBalance(winner.amount);
            winner.save();
        }

    },

    logicAddPlayer(player, siteId) {
        if (this.players.map(p => p._id || p).includes(player._id)) return;
        const amount = this.logicGetDefaultStake();
        this.players.push(player);
        const site = this.sites.id(siteId);
        site.player = player;
        site.amount = amount;
        player.addBalance(-amount);
        player.save();
        this.logicStartupBet(player);
        //this.logicSetTurn(player)
    },

    logicStartupBet(player) {
        if (this.players.length === 1) {
            //SMALL BLIND
            this.logicBet(this.options.blind, player);
        }
        if (this.players.length === 2) {
            //BIG BLIND
            this.logicBet(this.options.blind * 2, player);
        }
    },

    logicBet(value, player) {
        const site = this.sites.find(s => this.comparePlayers(s.player, player))
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

    logicGetRoundWinners(table) {
        const results = this.getRoundResults(table);
        let max = 0;
        for (const s of results) {
            if (s.value > max) max = s.value
        }
        const winners = results.filter(s => s.result === max);
        return winners.map(w => {
            return {player: w.player, amount: table.currentRound.bank / winners.length}
        });
    },

    logicGetRoundResults() {
        const results = [];
        for (const player of this.players) {
            const turns = table.roundTurns.filter(t => this.comparePlayers(t.player, player._id));
            let value = 0;
            for (const t of turns) {
                for (const dice of t.data.dices) {
                    value += dice;
                }
            }
            results.push({player, value});
        }
        return results;
    },

    logicNewTurnData(prevTurn) {
        const counter = prevTurn ? prevTurn.data.counter + 1 : 0;
        const data = {dices: [], counter};
        let lastInRound;
        if (counter >= this.turnsPerRound) lastInRound = true;

        for (let i = 0; i < this.dices; i++) {
            data.dices.push(Math.ceil(Math.random() * Math.floor(6)))
        }
        return {data, lastInRound};
    },


}
