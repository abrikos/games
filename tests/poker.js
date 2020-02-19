import pokerLogic from "server/games/poker/Poker";
import Table from "server/games/Table";
import Mongoose from "server/db/Mongoose";
const logger = require('logat');
const Poker = new pokerLogic();
const TABLE = new Table();
const abr = "5dde42f608810e33ea74b73c";
const sanya = "5dde5e2f422b1d49bb8d53cc";
const u3 = "5dff2858ed5d7264b171350f";
const u4 = "5dff2858ed5d7264b1713510";
/*
cd ~/WebstormProjects/games
NODE_PATH=. node -r esm tests/poker.js
*/


async function main() {
    await Mongoose.Table.deleteMany().then(console.log)
    await Mongoose.poker.deleteMany().then(console.log)
    //await Mongoose.poker.deleteMany();
    let table = await TABLE.create(abr, 'poker', Mongoose.poker.defaultOptions);

    await TABLE.join(table.id, sanya);
    await Poker.bet(table.id, abr, 6.1);
    logger.info('TODO: WRONG AMOUNT')
    await Poker.bet(table.id, sanya, 6);
    return
    //FLOP for 2 players


    //await TABLE.join(table.id, u3);

    await Poker.bet(table.id, abr, 6);



    await Poker.bet(table.id, abr, 7);
    await Poker.bet(table.id, sanya, 7);


    await Poker.bet(table.id, abr, 8);
    await Poker.bet(table.id, sanya, 8);
    //FINISH GAME and start newGAME

    await Poker.bet(table.id, abr, 9);
    await log(table);
}


main()
    .then(Mongoose.close)
    .catch(e=>{
        console.log(e)
        Mongoose.close()
    });

async function log(table) {
    const poker = await Mongoose.poker.findOne({table, active:true}).populate('table');
    logger.info('ID', poker.id)
    logger.info('LOG',  poker.pot.sites)
}
