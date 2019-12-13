const logger = require('logat');
export default {
    maxPlayers: 4,
    turnsPerRound: 4,
    dices: 2,

    canTurn(table, player) {
        //logger.info(table.turn, player)
        return !table.turn || table.turn.toString() === player.toString();
    },

    whoTurn(table) {
        const lastRound = table.rounds[table.rounds.length - 1];
        for (const turn of lastRound.turns) {
            if (!turn.dices) return turn.player;
        }
    },

    getRoundWinners(table) {
        const sums = [];
        for (const player of table.players) {
            const turns = table.roundTurns.filter(t => t.player.toString() === player._id.toString());
            let sum = 0;
            for (const t of turns) {
                for (const dice of t.data.dices) {
                    sum += dice;
                }
            }
            sums.push({player, sum});
        }
        let max = 0;
        for (const s of sums) {
            if (s.sum > max) max = s.sum
        }
        const winners = sums.filter(s=>s.sum===max);
        return winners.map(w=>{return {player:w.player._id, amount: table.lastRound.bank / winners.length}});
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
