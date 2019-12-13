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

    createTurn(player) {
        return {date: new Date(), player}
    },

    createRound(player) {
        const turns = [this.createTurn(player)]
        return {start: new Date(), turns}
    },

    makeTurn(table, player) {
        const turn = this.createTurn(player);
        const lastRound = table.rounds[table.rounds.length - 1];
        if (lastRound.turns.length + 1 === this.turnsPerRound) {
            turn.last = true;
        }
        turn.dices = [];
        for (let i = 0; i < this.dices; i++) {
            turn.dices.push(Math.ceil(Math.random() * Math.floor(6)))
        }
        return turn;

    }

}
