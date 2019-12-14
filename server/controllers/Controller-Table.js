import Mongoose from "server/db/Mongoose";
import {rword} from 'rword';
import * as Games from "server/games";

const passportLib = require('server/lib/passport');
const passport = require('passport');
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


    app.post('/api/table/leave/:id', passportLib.isLogged, (req, res) => {
        Mongoose.Table.findById(req.params.id)
            .populate('players')
            .then(table => {
                table.gameClass.onPlayerLeft(table)
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

    app.post('/api/table/join/:id/:site', passportLib.isLogged, (req, res) => {
        Mongoose.Table.findById(req.params.id)
            .populate('players')
            .then(table => {
                if (table.players.includes(req.session.userId)) return res.sendStatus(200)
                if (!table.canJoin) return res.send({error: 500, message: 'Table is full'});
                table.extendLogic();
                table.logicAddPlayer(req.session.userId, req.params.site);
                table.save()
                    .then(t => {
                        t.populate('players').execPopulate();
                        websocketSend('join', t);
                        res.sendStatus(200)
                    })

            })
            .catch(e => res.send({error: 500, message: e.message}))
    });

    app.post('/api/table/create/:game', passportLib.isLogged, (req, res) => {
        const table = new Mongoose.Table({game: req.params.game});
        table.extendLogic();
        if (!table.logicAttached) return res.sendStatus(406);
        const words = rword.generate(2, {length: '3-4'}).join(' ');
        table.name = words.replace(/^./, words[0].toUpperCase());
        table.options = table.logicCheckOptions(req.body);

        Mongoose.User.findById(req.session.userId)
            .then(user => {
                for(let i=0; i<table.maxPlayers; i++){
                    table.sites.push({})
                }
                table.logicAddPlayer(user, table.sites[0]._id);
                table.realMode = user.realMode;
                table.save()
                    .then(g => {
                        websocketSend('create', table);
                        res.send({id: table.id})
                    })
                    .catch(e => res.send({error: 500, message: e.message}))
            })
            //.catch(e => res.send({error: 500, message: e.message}))


    });

    app.post('/api/table/list/active/:game', passportLib.isLogged, (req, res) => {
        Mongoose.Table.find({active: true, game: req.params.game})
            .sort({updatedAt: -1})
            .then(tables => {
                res.send(tables)
            })
    });

    //Mongoose.User.find().then(us=>{        for(const u of us){            u.balanceVirtual = 100000000000;            u.save();        }    })

    app.post('/api/table/:id/change-stake', passportLib.isLogged, (req, res) => {
        Mongoose.Table.findById(req.params.id)
            .populate('players')
            .then(table => {
                const stake = table.stakes.find(s => s.player.toString() === req.session.userId);
                const player = table.players.find(s => s._id.toString() === req.session.userId);
                const amount = req.body.amount * req.body.factor;
                stake.amount += amount;
                player.addBalance(-amount);
                player.save();
                table.save()
                    .then(t => {
                        res.send({stake, balance: {amount: player.balance}})
                    })

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
