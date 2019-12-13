const logger = require('logat');
export default {
    maxPlayers: 4,
    turnsPerRound: 4,
    dices: 2,

    options: [
        {name: "defaultBet", type: "number", step:0.01, label: "Default bet", default:100},
        {name: "dices", type: "select", options: [2, 3, 4, 5], label: "Count of dices", default:2},
        {name: "maxPlayers", type: "select", options: [2, 3, 4, 5], label: "Max players", default:3},
        {name: "waitPlayer", type: "range", min:30, max:120, label: "Seconds to wait players turn", default:45}
    ],

    payWinners(table){
        for(const winner of this.getRoundWinners(table)){
            winner[table.isVirtual?'balanceVirtual':'balance'] += winner.amount;
            winner.save();
        }

    },

    checkOptions(options){
        const data = {};
        for(const option of this.options){
            const value = options[option.name] || option.default;
            data[option.name] = value;
        }
        return data;
    },

    getRoundWinners(table) {
        const results = this.getRoundResults(table);
        let max = 0;
        for (const s of results) {
            if (s.value > max) max = s.value
        }
        const winners = results.filter(s => s.result === max);
        return winners.map(w => {
            return {player: w.player, amount: table.lastRound.bank / winners.length}
        });
    },

    getRoundResults(table){
        const results = [];
        for (const player of table.players) {
            const turns = table.roundTurns.filter(t => t.player.toString() === player._id.toString());
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

    getTurnData(prevTurn) {
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
