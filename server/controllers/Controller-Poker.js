import Mongoose from "server/db/Mongoose";
import pokerLogic from "server/games/Poker";

const passportLib = require('server/lib/passport');
const logger = require('logat');


module.exports.controller = async function (app) {
    const Poker = new pokerLogic(app);
    if (0) {
        await Mongoose.Poker.deleteMany().exec(console.log);
        const u1 = "5dde5e2f422b1d49bb8d53cc";
        const u2 = "5dde42f608810e33ea74b73c";
        let record = await Poker.create({}, u1);
        record = await Poker.join(record.id, u2);
        record = await Poker.bet(record.id, u1, 5);
        console.log(record.round);
    }


    app.post('/api/poker/options', passportLib.isLogged, (req, res) => {
        res.send(Poker.options)
    });


    app.post('/api/poker/:id/leave', passportLib.isLogged, (req, res) => {
        Poker.leave(req.params.id, req.session.userId);
        res.sendStatus(200);
    });

    app.post('/api/poker/:id/bet', passportLib.isLogged, (req, res) => {
        Poker.bet(req.params.id, req.session.userId, req.body.bet);
        res.sendStatus(200)
    });

    app.post('/api/poker/:id/fold', passportLib.isLogged, (req, res) => {
        Poker.fold(req.params.id, req.session.userId);
        res.sendStatus(200)
    });


    app.post('/api/poker/:id/join/site/:site', passportLib.isLogged, (req, res) => {
        Poker.join(req.params.id, req.session.userId, req.params.site);
        res.sendStatus(200)
    });


    app.post('/api/poker/create', passportLib.isLogged, (req, res) => {
        Poker.create(req.body, req.session.userId);
        res.sendStatus(200)
    });

    //Mongoose.Bet.find({round:"5df78d95d2c18502cd14af8b"}).sort({createdAt:-1}).then(console.log)
    //Mongoose.Round.findById("5df78d95d2c18502cd14af8b").populate('bets').then(console.log)
    //Mongoose.Poker.findOne().sort({createdAt:-1}).populate(Mongoose.Poker.population).then(t=>console.log(t.playerBet));
    //Mongoose.Poker.deleteMany({}).then(console.log)

    app.post('/api/poker/list/active', (req, res) => {
        //Mongoose.User.findById(req.session.userId);
        Mongoose.Poker.find({active: true})
            .populate(Mongoose.Poker.population)
            .sort({updatedAt: -1})
            .then(pokers => {
                res.send(pokers)
            })
    });

    app.post('/api/poker/:id/stake/change', passportLib.isLogged, (req, res) => {
        Poker.stakeChange(req.params.id, req.session.userId, req.body);
        res.sendStatus(200)
    });


    app.post('/api/poker/:id', passportLib.isLogged, async (req, res) => {
        Poker.getRecord(req.params.id)
            .then(poker => {
                //poker.logicHideOtherPlayers(req.session.userid);
                poker.playerSite = poker.siteOfPlayer(req.session.userId);
                res.send(poker)
            })
        //.catch(e => res.send({error: 500, message: e.message}))
    });

};
