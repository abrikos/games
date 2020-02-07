import Mongoose from "server/db/Mongoose";
import {rword} from "rword";
import * as Games from 'server/games';

const passportLib = require('server/lib/passport');
const logger = require('logat');

//Mongoose.Table.findOne().sort({createdAt:-1}).then(console.log)
//Mongoose.Table.deleteMany().then(console.log)

module.exports.controller = function (app) {

    app.post('/api/table/:id/join/site/:sid', passportLib.isLogged, async (req, res) => {
        Mongoose.Table.findById(req.params.id)
            .then(async table => {
                const player = await Mongoose.User.findById(req.session.userId);
                if (table.siteOfPlayer(player)) return res.send({error: 500, message: 'Your site'});
                if (!table.canJoin) return res.send({error: 500, message: 'Table are full'});
                const GameLogic = new Games[table.game](app);
                const GameModel = await Mongoose[table.game].findOne({table}).populate(Mongoose[table.game].population);

                if (!table.sites.find(s => !s.player)) return res.send({error: 500, message: 'No sites available'});
                //const stake = table.options.blind * 100;
                let site = table.sites.find(s => s.equals(req.params.sid));
                if (!site) {
                    site = table.sites.find(s => !s.player);
                }

                site.player = player;
                site.stake = GameModel.initialStake;
                player.addBalance(-site.stake);
                await table.save();
                await GameLogic.onJoin(GameModel);
                websocketSend('join', table.id, table.game, req.session.userId);
                res.sendStatus(200)
            })
    });

    app.post('/api/table/list/:game', async (req, res) => {
        const game = req.params.game;
        Mongoose.Table.find({game, active: true})
            .sort({createdAt:-1})
            .then(list => res.send(list))
    });

    app.post('/api/table/create/:game', passportLib.isLogged, async (req, res) => {
        const game = req.params.game;
        //const GameLogic = new Games[game](app);
        const player = await Mongoose.User.findById(req.session.userId);
        const table = new Mongoose.Table({game});

        const words = rword.generate(2, {length: '3-4'}).join(' ');
        table.name = words.replace(/^./, words[0].toUpperCase());
        table.realMode = player.realMode;

        const GameModel = await Mongoose[game].create({table});
        for (const option of GameModel.defaultOptions) {
            table.options[option.name] = req.body[option.name] || option.default;
        }

        for (let position = 0; position < table.maxPlayers; position++) {
            //const player = position ? null : user;
            table.sites.push({position})
        }
        table.realMode = player.realMode;

        //await table.populate(Mongoose.Table.population).execPopulate();
        table.takeSite({player, stake: GameModel.initialStake});
        await table.save();

        websocketSend('create', table.id, game, player._id);
        res.sendStatus(200)
    });

    function websocketSend(action, id, game, player) {
        app.locals.wss.clients.forEach(function each(client) {
            logger.info(client)
            client.send(JSON.stringify({action, id, game, timestamp: new Date(), player}));
        });
    }
};
