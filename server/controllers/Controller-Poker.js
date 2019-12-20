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

    function testDeck() {
        const random = 0;
        let deck = [];
        let hands = [];
        let table;
        if (!random) {
            const h = [
                ['C2', 'D6'],
                ['CK', 'S9']
            ];
            for (let i = 0; i < h.length; i++) {
                hands.push({cards: [Poker._card(h[i][0]), Poker._card(h[i][1])]});
                deck = deck.concat(h[i])
            }
            const t = ['SK', 'H2', 'D9','CJ','H6'];
            //const t = ['H2', 'D7', 'D8', 'DA', 'D3'];
            deck = deck.concat(t);
            table = deck.splice(h.length + 2, 5).map(c => Poker._card(c));
        } else {
            deck = Poker._deck;
            for (let i = 0; i < random; i++) {
                hands.push({_id:i, cards: [deck.pop(),deck.pop()]});
            }
            table = deck.splice(0,5);
        }



        for (const c of hands) {
            c.result = Poker._combination(c.cards, table)
        }

        const winners = Poker._winners(hands, table);
        return {hands, table, winners}
    }

    testDeck()

    app.post('/api/poker/deck', (req, res) => {
        res.send(testDeck())
    });


    app.post('/api/poker/:id', passportLib.isLogged, async (req, res) => {
        Poker.getRecord(req.params.id)
            .then(poker => {
                poker.playerSite = poker.siteOfPlayer(req.session.userId);
                if (poker.pot) poker.pot.deck = [];
                if (0) poker.sites = poker.sites.map(s => {
                    s.cards = [false, false];
                    return s
                });
                res.send(poker)
            })
        //.catch(e => res.send({error: 500, message: e.message}))
    });

};
