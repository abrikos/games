import Mongoose from "server/db/mongoose";

const passportLib = require('server/lib/passport');
const passport = require('passport');
const logger = require('logat');
const moment = require('moment');

//Mongoose.Filler.deleteMany().then(console.log)

module.exports.controller = function (app) {

    app.post('/api/filler/:id/view', passportLib.isLogged, (req, res) => {
        Mongoose.Filler.findById(req.params.id)
            .populate(['player', 'opponent'])
            .catch(error => res.send({error: 500, message: error.message}))
            .then(filler => {
                if (filler.player.toString() === req.session.userId) filler.turn = 'player';
                if (filler.opponent && filler.opponent.toString() === req.session.userId) filler.turn = 'opponent';
                filler.save()
                    .then(f => res.send(f))
            })

    });

    app.post('/api/filler/:id/accept', passportLib.isLogged, (req, res) => {
        Mongoose.Filler.findById(req.params.id)
            .catch(error => res.send({error: 500, message: error.message}))
            .then(filler => {
                if (filler.opponent) return res.sendStatus(403);
                filler.opponent = req.session.userId;
                filler.turn = 'opponent';
                const cells = filler.cells;
                cells[cells.length-1].availableFill = cells[cells.length-1].fill;
                cells[cells.length-1].availableUser = req.session.userId;
                filler.fill(cells[cells.length-1]);
                filler.save();
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
            .populate(['player', 'opponent'])
            .catch(error => res.send({error: 500, message: error.message}))
            .then(fillers => {
                res.send({
                    my: fillers.filter(f => f.player._id.toString() === req.session.userId),
                    accepted: fillers.filter(f => f.opponent && f.opponent._id.toString() === req.session.userId),
                })
            })

    });

    app.post('/api/filler/:id/click/:index', passportLib.isLogged, (req, res) => {
        Mongoose.Filler.findById(req.params.id)
            .populate('opponent')
            .catch(error => res.send({error: 500, message: error.message}))

            .then(filler => {
                if (!filler.opponent) return res.send({error: 500, message: 'No opponent'});
                if (filler[filler.turn]._id.toString() !== req.session.userId.toString()) return res.send({error: 500, message: 'Not your turn'});
                const cell = filler.cells.id(req.params.index);
                if (!cell) return res.sendStatus(406);
                if (cell.captured) return res.sendStatus(406);
                filler.fill(cell);
                filler.lastField = req.params.index;
                filler.turn = filler.turn === 'opponent' ? 'player' : 'opponent';
                filler.save()
                    .then(f => {
                        res.send(f)
                    })

            })

    });


    app.post('/api/filler/levels', (req, res) => {
        res.send(Mongoose.Filler.levels);
    });

    app.post('/api/filler/create/:level', passportLib.isLogged, (req, res) => {
        const level = Mongoose.Filler.levels[req.params.level * 1];
        if (!level) return res.sendStatus(406);
        Mongoose.User.findById(req.session.userId)
            .catch(error => res.send({error: 500, message: error.message}))
            .then(player => {
                const cells = [];
                for (let index = 0; index < level.rows * level.cols; index++) {
                    let row = Math.floor(index / level.cols);
                    let col = index % level.cols;
                    const fill = level.colors[Math.floor(Math.random() * level.colors.length)];
                    cells.push({index, row, col, fill})
                }
                cells[0].availableFill = cells[0].fill;
                cells[0].availableUser = req.session.userId;
                Mongoose.Filler.create({player, cells, turn:'player', ...level})
                    .then(filler => {
                        filler.fill(cells[0]);
                        filler.save()
                            .then(f => res.send(f))

                    })
            })

    })
};
