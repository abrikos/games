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
                const cell = cells[cells.length - 1];
                cell.availableFill = cell.fill;
                cell.availableUser = req.session.userId;
                filler.fill(cell);
                filler.lastColor = cell.fill;
                filler.save();
                res.send(filler)
            })
    });

    app.post('/api/filler/available', (req, res) => {
        Mongoose.Filler.find({opponent: null})
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
                if (cell.availableUser.toString() !== filler[filler.turn]._id.toString()) return res.send({error: 500, message: 'Not your cell'});
                if (cell.lastColor === cell.fill) return res.send({error: 500, message: 'Color abandoned'});
                if (!cell) return res.sendStatus(406);
                if (cell.captured) return res.sendStatus(406);
                filler.fill(cell);
                filler.lastColor = cell.fill;
                filler.turn = (filler.turn === 'opponent') ? 'player' : 'opponent';
                throw "HOW TO MAKE SKIP TURN when no moves";
                for (const c of filler.cells.filter(c1 => c1.fill === cell.fill && c1.availableUser.toString()===filler[filler.turn]._id.toString())) {
                    c.availableUser = null;
                }

                const available = filler.cells.filter(c=>c.availableUser.toString()===filler[filler.turn]._id.toString());
                logger.info(available)
                if(!available.length){
                    filler.turn = (filler.turn === 'opponent') ? 'player' : 'opponent';
                    filler.message = 'NO VARIANTS'
                }

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

                cells[0].fill = 'red';
                cells[1].fill = 'red';
                cells[2].fill = 'blue';
                cells[level.cols].fill = 'blue';
                cells[level.cols + 1].fill = 'blue';
                cells[level.cols *level.rows- 2].fill = 'blue';



                cells[0].availableFill = cells[0].fill;
                cells[0].availableUser = req.session.userId;
                const lastColor = cells[0].fill;
                Mongoose.Filler.create({player, cells, lastColor, turn: 'player', ...level})
                    .then(filler => {
                        filler.fill(cells[0]);

                        filler.save()
                            .then(f => res.send(f))

                    })
            })

    })
};
