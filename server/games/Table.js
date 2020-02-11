import Mongoose from "server/db/Mongoose";
import {rword} from "rword";
import * as Games from "server/games/index";

const logger = require('logat');

export default class Table {

    async join(id, userId, siteId) {

        const table = await Mongoose.Table.findById(id);
        const GameModel = await Mongoose[table.game].findOne({table, active: true}).populate(Mongoose[table.game].population);
        const player = await Mongoose.User.findById(userId);
        if (GameModel.table.siteOfPlayer(player)) return logger.error({error: 500, message: 'Your site'});
        if (!GameModel.table.canJoin) return logger.error({error: 500, message: 'Table are full'});

        GameModel.table.takeSite({player, stake: GameModel.initialStake});

        await GameModel.table.save();
        const GameLogic = new Games[table.game]();
        await GameLogic.onJoin(GameModel);

        return table;
    }

    async create(userId, game, options) {
        const player = await Mongoose.User.findById(userId);
        const table = new Mongoose.Table({game});

        const words = rword.generate(2, {length: '3-4'}).join(' ');
        table.name = words.replace(/^./, words[0].toUpperCase());
        table.realMode = player.realMode;

        const GameModel = await Mongoose[game].create({table});
        for (const option of GameModel.defaultOptions) {
            table.options[option.name] = options[option.name] || option.default;
        }

        for (let position = 0; position < table.maxPlayers; position++) {
            //const player = position ? null : user;
            table.sites.push({position})
        }
        table.realMode = player.realMode;

        //await table.populate(Mongoose.Table.population).execPopulate();
        table.takeSite({player, stake: GameModel.initialStake});
        await table.save();

        return table;
    }


}
