import * as Games from "server/games";
import Mongoose from "server/db/Mongoose";
import {rword} from 'rword';

const passportLib = require('server/lib/passport');
const passport = require('passport');
const logger = require('logat');

module.exports.controller = function (app) {


    app.post('/api/table/leave/:id', passportLib.isLogged, (req, res) => {
        Mongoose.Table.findById(req.params.id)
            .then(table => {
                table.removePlayer(req.session.userId);
                table.save();
                res.send(table);
                res.wss.clients.forEach(function each(client) {
                    client.send(JSON.stringify({action: 'leave', table}));
                });
            })
            .catch(e => res.send({error: 500, message: e.message}))
    });

    app.post('/api/table/join/:id', passportLib.isLogged, (req, res) => {
        Mongoose.Table.findById(req.params.id)
            .then(table => {


                /*res.wss.clients.forEach(function each(client) {
                    client.send(JSON.stringify({action: 'join', table}));
                });*/



                if (table.players.includes(req.session.userId)) return res.send(table)
                if (!table.canJoin) return res.send({error: 500, message: 'Table is full'});
                table.addPlayer(req.session.userId);
                table.save()
                    .then(t => {
                        res.wss.clients.forEach(function each(client) {
                            client.send(JSON.stringify({action: 'join', table}));
                        });
                        res.send(t)
                    })
                    .catch(e => res.send({error: 500, message: e.message}))
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
        if (!Games[req.params.game]) return res.sendStatus(406);
        const table = new Games[req.params.game]();
        table.name = rword.generate(2, {length: '3-4'}).join(' ');
        table.addPlayer(req.session.userId);
        table.save()
            .then(g => {
                res.wss.clients.forEach(function each(client) {
                    client.send(JSON.stringify({action: 'create', table}));
                });
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
    })
};
