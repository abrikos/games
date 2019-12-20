import Mongoose from "server/db/Mongoose";
import pokerLogic from "server/games/Poker";

const passportLib = require('server/lib/passport');
const logger = require('logat');
//Mongoose.Poker.deleteMany().exec(console.log);

module.exports.controller = async function (app) {
    const Poker = new pokerLogic(app);

    if (0) {

        const u1 = "5dde42f608810e33ea74b73c";
        const u2 = "5dde5e2f422b1d49bb8d53cc";

        let record = await Poker.create({}, u1);
        record = await Poker.join(record.id, u2);
        record = await Poker.bet(record.id, u1, 6);
        record = await Poker.bet(record.id, u2, 1);
        console.log(record.sites.id(record.round.turn));
        /*
        console.log(record.round);
        record = await Poker.bet(record.id, u2, 1);
        console.log(record.round);
        record = await Poker.bet(record.id, u1, 1);
        console.log(record.round);
        record = await Poker.bet(record.id, u2, 0);
        console.log(record.round);*/
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
            //.populate(Mongoose.Poker.population)
            .sort({updatedAt: -1})
            .then(pokers => {
                res.send(pokers.map(p => {
                    return {id: p.id, options: p.options, maxPlayers: p.maxPlayers, name: p.name, players: p.sitesActive.map(s => s.player)}
                }))
            })
    });

    app.post('/api/poker/:id/stake/change', passportLib.isLogged, (req, res) => {
        Poker.stakeChange(req.params.id, req.session.userId, req.body);
        res.sendStatus(200)
    });

    function testDeck(){
        let deck = ['H5','D6','CQ','H4','SK','H2','D9'];
        //deck = Poker._deck.map(c=>c.suit+c.value);
        const hand = [Poker._card(deck[0]), Poker._card(deck[1])];
        const table = [Poker._card(deck[2]), Poker._card(deck[3]), Poker._card(deck[4]), Poker._card(deck[5]), Poker._card(deck[6])];
        return {hand,table}
    }
    logger.info("COMBINATION",Poker._combination(testDeck()));

    app.post('/api/poker/deck', (req, res) => {
        const deck = testDeck();
        deck.result = Poker._combination(deck);
        logger.info(deck)
        res.send(deck)
    });


    app.post('/api/poker/:id', passportLib.isLogged, async (req, res) => {
        Poker.getRecord(req.params.id)
            .then(poker => {
                poker.playerSite = poker.siteOfPlayer(req.session.userId);
                if(poker.pot) poker.pot.deck = [];
                if(0) poker.sites = poker.sites.map(s=>{s.cards=[false,false]; return s});
                res.send(poker)
            })
        //.catch(e => res.send({error: 500, message: e.message}))
    });

};
