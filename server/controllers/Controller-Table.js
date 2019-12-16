import Mongoose from "server/db/Mongoose";
import {rword} from 'rword';
import * as Games from "server/games";

const passportLib = require('server/lib/passport');
const logger = require('logat');


module.exports.controller = function (app) {

    app.post('/api/table/:game/options', passportLib.isLogged, (req, res) => {
        const game = Games[req.params.game];
        if (!game) return res.sendStatus(406);
        res.send(game.logicOptions)
    });


    app.post('/api/table/:id/turn', passportLib.isLogged, (req, res) => {
        Mongoose.Table.findById(req.params.id)
            .populate('players')
            .then(table => {

                if (table.turn.toString() !== req.session.userId) return res.send({error: 500, message: 'Not you turn'});
                if (!table.rounds.length) table.addRound();
                const turn = {...table.newTurn(req.session.userId)};
                if (turn.lastInRound) {
                    const winners = table.gameClass.getRoundWinners(table);
                    table.turn = table.players[0]._id;
                    table.gameClass.beforeNewRound(table)
                    table.addRound();
                } else {
                    table.turn = table.nextPlayer(req.session.userId);
                }

                table.turns.push(turn);

                table.save()
                    .then(t => {

                    })
                    .catch(e => logger.error(e.message))
                ;
                websocketSend('turn', table);
                res.sendStatus(200)
            })
            .catch(e => res.send({error: 500, message: e.message}))
    });

    app.post('/api/table/:id/leave', passportLib.isLogged, (req, res) => {
        Mongoose.Table.findById(req.params.id)
            .populate(Mongoose.Table.population)
            .then(async table => {
                table.extendLogic();
                websocketSend('leave', table, req.session.userId);
                await table.logicRemovePlayer(req.session.userId);

                if (table.sitesActive.length === 0) {
                    table.delete();
                    return res.sendStatus(200)
                }
                if (table.sitesActive.length === 1) await table.logicReturnBet(table.sitesActive[0].player);
                table.save();
                res.sendStatus(200);
            })
            .catch(e => res.send({error: 500, message: e.message}))
    });

    app.post('/api/table/:id/bet', passportLib.isLogged, (req, res) => {
        Mongoose.Table.findById(req.params.id)
            .populate(Mongoose.Table.population)
            .then(async table => {
                table.extendLogic();
                if (!await table.logicPlayerBet(req.body.bet, req.session.userId)) return res.sendStatus(406);
                table.save();
                websocketSend('bet', table);
                res.sendStatus(200)
            });
    });

    app.post('/api/table/:id/join/site/:site', passportLib.isLogged, (req, res) => {
        Mongoose.Table.findById(req.params.id)
            .populate(Mongoose.Table.population)
            .then(table => {
                Mongoose.User.findById(req.session.userId)
                    .then(user => {
                        if (table.siteOfPlayer(user.id)) return res.sendStatus(200);
                        if (!table.canJoin) return res.send({error: 500, message: 'Table is full'});
                        table.extendLogic();
                        table.logicTakeSite(user, req.params.site);
                        table.save()
                            .then(t => {
                                websocketSend('join', t, req.session.userId);
                                res.sendStatus(200)
                            })
                    })
            })
        //.catch(e => res.send({error: 500, message: e.message}))
    });

    app.post('/api/table/create/:game', passportLib.isLogged, async (req, res) => {
        const table = new Mongoose.Table({game: req.params.game});
        table.extendLogic();
        if (!table.logicAttached) return res.sendStatus(406);
        const words = rword.generate(2, {length: '3-4'}).join(' ');
        table.name = words.replace(/^./, words[0].toUpperCase());
        table.options = table.logicCheckOptions(req.body);

        const user = await Mongoose.User.findById(req.session.userId)

        for (let position = 0; position < table.maxPlayers; position++) {
            const player = position ? null : user;
            await Mongoose.Site.create({table, position, player});
            //const site = new Mongoose.Site({table});
            //await site.save();
            //table.sites.push({position})
        }
        const pot = await Mongoose.Pot.create({table})
        await Mongoose.Round.create({pot})
        table.realMode = user.realMode;
        await table.save()
        await table.populate(Mongoose.Table.population).execPopulate()
        table.extendLogic();
        await table.logicTakeSite(user);
        websocketSend('create', table);
        res.send({id: table.id})
        //.catch(e => res.send({error: 500, message: e.message}))

        //.catch(e => res.send({error: 500, message: e.message}))


    });

    //Mongoose.Bet.find({round:"5df78d95d2c18502cd14af8b"}).sort({createdAt:-1}).then(console.log)
    //Mongoose.Round.findById("5df78d95d2c18502cd14af8b").populate('bets').then(console.log)
    //Mongoose.Table.findOne().sort({createdAt:-1}).populate(Mongoose.Table.population).then(t=>console.log(t.playerBet));
    //Mongoose.Table.deleteMany({}).then(console.log)

    app.post('/api/table/list/active/:game', (req, res) => {
        //Mongoose.User.findById(req.session.userId);
        Mongoose.Table.find({active: true, game: req.params.game})
            .populate(Mongoose.Table.population)
            .sort({updatedAt: -1})
            .then(tables => {
                res.send(tables)
            })
    });

    app.post('/api/table/:id/site/player', passportLib.isLogged, (req, res) => {
        Mongoose.Table.findById(req.params.id)
            .populate(Mongoose.Table.population)
            .then(table => {
                res.send(table.siteOfPlayer(req.session.userId));
            })
            .catch(e => res.send({error: 500, message: e.message}))
    });

    app.post('/api/table/:id/stake/change', passportLib.isLogged, (req, res) => {
        Mongoose.Table.findById(req.params.id)
            .populate(Mongoose.Table.population)
            .then(table => {
                const site = table.siteOfPlayer(req.session.userId);
                const amount = req.body.amount * req.body.factor;
                site.stake += amount;
                site.player.addBalance(-amount);
                site.player.save();
                table.save()
                    .then(t => {
                        websocketSend('stake/change', table, req.session.userId);
                        res.send({site, balance: {amount: site.player.balance}})
                    })

            })
            .catch(e => res.send({error: 500, message: e.message}))
    });


    app.post('/api/table/:id', passportLib.isLogged, (req, res) => {

        Mongoose.Table.findById(req.params.id)
            .populate(Mongoose.Table.population)
            .then(table => {
                //table.logicHideOtherPlayers(req.session.userid);
                table.playerSite = table.siteOfPlayer(req.session.userId);
                res.send(table)
            })
        //.catch(e => res.send({error: 500, message: e.message}))
    });

    function websocketSend(action, table, player) {
        app.locals.wss.clients.forEach(function each(client) {
            client.send(JSON.stringify({action, id: table.id, game: table.game, timestamp: new Date(), player: player}));
        });
    }
};
