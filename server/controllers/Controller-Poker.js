import Mongoose from "server/db/Mongoose";
import pokerLogic from "server/games/poker/Poker";

const passportLib = require('server/lib/passport');
const logger = require('logat');

//Mongoose.User.create({id: 1, photo_url:'https://ktonanovenkogo.ru/image/bot-chto-takoe.jpg', first_name:'Bot 1'})    .then(console.log);

module.exports.controller = async function (app) {
    console.log('Poker controller starts');
    const Poker = new pokerLogic();


    app.post('/api/poker/options', passportLib.isLogged, (req, res) => {
        res.send(Mongoose.poker.defaultOptions)
    });


    /*app.post('/api/poker/:id/leave', passportLib.isLogged, (req, res) => {
        Poker.leave(req.params.id, req.session.userId);
        res.sendStatus(200);
    });*/

    app.post('/api/poker/:id/bet', passportLib.isLogged, async (req, res) => {
        const record = await Poker.bet(req.params.id, req.session.userId, req.body.bet);
        _websocketSend('bet', record);
        res.sendStatus(200)
    });

    /*app.post('/api/poker/:id/fold', passportLib.isLogged, (req, res) => {
        Poker.bet(req.params.id, req.session.userId, -1);
        res.sendStatus(200)
    });*/


    app.post('/api/poker/:id/stake/change', passportLib.isLogged, async (req, res) => {
        const record = await Poker.stakeChange(req.params.id, req.session.userId, req.body);
        _websocketSend('stake/change', record, req.session.userId);
        res.sendStatus(200)
    });


    app.post('/api/poker/:id', passportLib.isLogged, async (req, res) => {
        Mongoose.poker.findOne({table:req.params.id, active: true})
            .populate(Mongoose.poker.population)
            .then(record => {
                if(!record) return res.send({error: 500, message: 'No active game'});
                if(!record.table) return res.send({error: 500, message: 'Wrong game table'});
                record.playerSite = record.table.siteOfPlayer(req.session.userId);
                logger.info(record.pots)
                //if (poker.pot) poker.pot.deck = [];
                res.send(record)
            })
        //.catch(e => res.send({error: 500, message: e.message}))
    });

    function _websocketSend(action, record, player) {
        app.locals.wss.clients.forEach(function each(client) {
            client.send(JSON.stringify({action, id: record.table.id, game: 'poker', timestamp: new Date(), player: player}));
        });
    }
};
