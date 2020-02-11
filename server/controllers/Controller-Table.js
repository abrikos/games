import Mongoose from "server/db/Mongoose";
import {rword} from "rword";
import * as Games from 'server/games';
import Table from "server/games/Table";

const passportLib = require('server/lib/passport');
const logger = require('logat');

//Mongoose.Table.findOne().sort({createdAt:-1}).then(console.log)
//Mongoose.Table.deleteMany().then(console.log)

module.exports.controller = function (app) {
    const TABLE = new Table(app);
    app.post('/api/table/:id/join/site/:sid', passportLib.isLogged, async (req, res) => {
        const table = await TABLE.join(req.params.id, req.session.userId, req.params.sid);
        this._websocketSend('join', table.id, table.game, req.session.userId);
        res.sendStatus(200);
    });

    app.post('/api/table/list/:game', async (req, res) => {
        const game = req.params.game;
        Mongoose.Table.find({game, active: true})
            .sort({createdAt:-1})
            .then(list => res.send(list))
    });

    app.post('/api/table/create/:game', passportLib.isLogged, async (req, res) => {
        const table = await TABLE.create(req.session.userId, req.params.game, req.body);
        this._websocketSend('create', table.id, table.game, req.session.userId);
        res.sendStatus(200)
    });

    function _websocketSend(action, id, game, player) {
        app.locals.wss.clients.forEach(function each(client) {
            client.send(JSON.stringify({action, id, game, timestamp: new Date(), player}));
        });
    }
};
