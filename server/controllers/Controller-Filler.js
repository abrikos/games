import Mongoose from "server/db/mongoose";
import FillerField from "server/lib/FillerField";

const passportLib = require('server/lib/passport');
const passport = require('passport');
const logger = require('logat');
const moment = require('moment');

module.exports.controller = function (app) {

    app.post('/api/filler/view/:id', passportLib.isLogged, (req, res) => {
        Mongoose.Filler.findById(req.params.id)
            .populate(['player', 'opponent'])
            .catch(error => res.send({error: 500, message: error.message}))
            .then(filler => {
                let turn = 'guest';
                if (filler.turn.toString() === req.session.userId) turn = 'player';
                if (filler.turn.toString() === req.session.userId) turn = 'opponent';
                res.send({turn, filler})
            })

    });

    app.post('/api/filler/accept/:id', passportLib.isLogged, (req, res) => {
        Mongoose.Filler.findById(req.params.id)
            .catch(error => res.send({error: 500, message: error.message}))
            .then(filler => {
                if (filler.opponent) return res.sendStatus(403);
                filler.turn = filler.opponent = req.session.userId;
                filler.save()
                res.send(filler)
            })
    });

    app.post('/api/filler/available', (req, res) => {
        Mongoose.Filler.find({lastCell: 0, opponent: null})
            .sort({createdAt: -1})
            .populate('player')
            .catch(error => res.send({error: 500, message: error.message}))
            .then(fillers => {
                res.send(fillers)
            })

    });

    app.post('/api/filler/user/list', passportLib.isLogged, (req, res) => {
        Mongoose.Filler.find({$or: [{player: req.session.userId}, {opponent: req.session.userId}]})
            .sort({createdAt: -1})
            .populate(['player','opponent'])
            .catch(error => res.send({error: 500, message: error.message}))
            .then(fillers => {
                res.send({
                    my: fillers.filter(f=>f.player._id.toString() === req.session.userId),
                    accepted: fillers.filter(f=>f.opponent && f.opponent._id.toString() === req.session.userId),
                })
            })

    });

    app.post('/api/filler/:id/click/:index', passportLib.isLogged, (req, res) => {
        Mongoose.Filler.findById(req.params.id)
            .catch(error => res.send({error: 500, message: error.message}))
            .then(filler => {
                if (filler.turn !== req.session.userId) return res.sendStatus(403);
                const field = new FillerField(filler.field);
                const cell = field.cells[req.params.index];
                if (!cell) return res.sendStatus(406);
                if (cell.captured) return res.sendStatus(406);
                field.fill(cell);
                filler.field = field;
                filler.lastField = req.params.index;

                filler.save()
                    .then(f => res.send(f))

            })

    });

    app.post('/api/filler/create', passportLib.isLogged, (req, res) => {
        Mongoose.User.findById(req.session.userId)
            .catch(error => res.send({error: 500, message: error.message}))
            .then(player => {
                const field = new FillerField();
                field.cells[0].available = field.cells[0].fill;
                field.fill(field.cells[0]);
                Mongoose.Filler.create({field, player})
                    .then(filler => res.send(filler))
            })

    })
};
