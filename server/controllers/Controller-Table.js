import * as Games from "server/games";
import Mongoose from "server/db/Mongoose";
import {rword} from 'rword';

const passportLib = require('server/lib/passport');
const passport = require('passport');
const logger = require('logat');

module.exports.controller = function (app) {

    app.post('/api/table/:game/options', passportLib.isLogged, (req, res) => {
        const game = Games[req.params.game];
        if (!game) return res.sendStatus(406);
        res.send(game.options)
    });


    app.post('/api/table/turn/:game/:id', passportLib.isLogged, (req, res) => {
        const game = Games[req.params.game];
        if (!game) return res.sendStatus(406);
        Mongoose.Table.findById(req.params.id)
            .populate('players')
            .then(table => {

                if (table.turn.toString() !== req.session.userId) return res.send({error: 500, message: 'Not you turn'});
                if (!table.rounds.length) table.addRound();
                const turn = {...table.newTurn(req.session.userId), ...game.getTurnData(table.prevTurn)};
                if (turn.lastInRound) {
                    const winners = game.getRoundWinners(table);
                    console.log(winners)
                    table.turn = table.players[0]._id;
                    table.addRound();
                    //TODO finish round
                } else {
                    table.turn = table.nextTurn(req.session.userId);
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


    app.post('/api/table/leave/:id', passportLib.isLogged, (req, res) => {
        Mongoose.Table.findById(req.params.id)
            .populate('players')
            .then(table => {
                table.removePlayer(req.session.userId);
                websocketSend('leave', table);
                if (!table.players.length) {

                    table.delete();
                    return res.sendStatus(200)
                }
                if (table.players.length === 1) {
                    table.turn = null
                }
                table.save()
                res.sendStatus(200);


            })
            .catch(e => res.send({error: 500, message: e.message}))
    });

    app.post('/api/table/join/:id', passportLib.isLogged, (req, res) => {
        Mongoose.Table.findById(req.params.id)
            .populate('players')
            .then(table => {
                const game = Games[table.game];
                if (table.players.includes(req.session.userId)) return res.send(table)
                if (!table.canJoin) return res.send({error: 500, message: 'Table is full'});
                table.addPlayer(req.session.userId);
                if (!table.turn) {
                    table.turn = req.session.userId;
                }
                table.save()
                    .then(t => {
                        t.populate('players').execPopulate();
                        websocketSend('join', t);
                        res.sendStatus(200)
                    })

            })
            .catch(e => res.send({error: 500, message: e.message}))
    });

    app.post('/api/table/list/active/:game', passportLib.isLogged, (req, res) => {
        Mongoose.Table.find({active: true, game: req.params.game})
            .sort({updatedAt: -1})
            .then(tables => {
                res.send(tables)
            })
    });

    app.post('/api/table/create/:game', passportLib.isLogged, (req, res) => {
        const game = Games[req.params.game];
        if (!game) return res.sendStatus(406);
        const table = new Mongoose.Table({game: req.params.game});
        const words = rword.generate(2, {length: '3-4'}).join(' ');
        table.name = words.replace(/^./, words[0].toUpperCase());
        table.options = game.checkOptions(req.body);
        if (req.body.maxPlayers) table.maxPlayers = req.body.maxPlayers;
        if (req.body.waitPlayer) table.waitPlayer = req.body.waitPlayer;
        table.addPlayer(req.session.userId);
        table.save()
            .then(g => {
                websocketSend('create', table);
                res.send(table)
            })
            .catch(e => res.send({error: 500, message: e.message}))

    });

    app.post('/api/table/:id', passportLib.isLogged, (req, res) => {
        Mongoose.Table.findById(req.params.id)
            .populate('players')
            .then(table => {
                res.send(table)
            })
            .catch(e => res.send({error: 500, message: e.message}))
    });

    function websocketSend(action, table) {
        app.locals.wss.clients.forEach(function each(client) {
            client.send(JSON.stringify({action: action, id: table.id, game: table.game}));
        });
    }
};
