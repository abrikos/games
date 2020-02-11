import pokerLogic from "server/games/poker/Poker";
import Table from "server/games/Table";
import Mongoose from "server/db/Mongoose";
const logger = require('logat');
const Poker = new pokerLogic();
const TABLE = new Table();
const u1 = "5dde42f608810e33ea74b73c";
const u2 = "5dde5e2f422b1d49bb8d53cc";
const u3 = "5dff2858ed5d7264b171350f";
const u4 = "5dff2858ed5d7264b1713510";
/*
cd ~/WebstormProjects/games
NODE_PATH=. node -r esm tests/poker.js
*/

async function main() {
    //await Mongoose.poker.deleteMany();
    let table = await TABLE.create(u1, 'poker', Mongoose.poker.defaultOptions);

    await TABLE.join(table.id, u2);
    console.log('U2 joined');
    await Poker.bet(table.id, u1, 5);
    //FLOP for 2 players

    await Poker.bet(table.id, u1, 6);

    await Poker.bet(table.id, u2, 6);

       return
    console.log('FLOP:')
    console.log('rize 5:')
    await Poker.bet(table.id, u1, 5);
    console.log('fold:')
    await Poker.bet(table.id, u2, -1);
    console.log('call 5:')
    await Poker.bet(table.id, u3, 5);

    console.log('TURN:');
    await Poker.bet(table.id, u1, 5);
    await Poker.bet(table.id, u3, 5);

    console.log('RIVER:');
    await Poker.bet(table.id, u1, 5);
    await Poker.bet(table.id, u3, 5);
}


main()
    .then(Mongoose.close)
    .catch(e=>{
        console.log(e)
        Mongoose.close()
    });

