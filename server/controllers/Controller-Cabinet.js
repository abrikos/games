import Mongoose from "server/db/Mongoose";

const passportLib = require('../lib/passport');
const logger = require('logat');

//Mongoose.User.find().then(console.log)
//Mongoose.User.updateMany({},{group:null}).then(console.log).catch(console.error)


module.exports.controller = function (app) {

    app.post('/api/cabinet/balance', passportLib.isLogged, (req, res) => {
        Mongoose.User.findById(req.session.userId)
            .then(user => {
                res.send({amount:user.balance})
            })
    });

    app.post('/api/cabinet/referrals', passportLib.isLogged, (req, res) => {
        Mongoose.User.findById(req.session.userId)
            .populate([{
                path: 'referrals',
            }])
            .then(user => {
                res.send(user.referrals)
            })
    });

    app.post('/api/cabinet/parents', passportLib.isLogged, (req, res) => {
        Mongoose.User.find({referrals: {$in: req.session.userId}})
            .then(users => {
                res.send(users)
            })
    });


    app.post('/api/cabinet/link', passportLib.isLogged, (req, res) => {
        res.send(`${process.env.SITE}/api/invite/${req.session.userId}`)
    });

    app.post('/api/cabinet/user', passportLib.isLogged, (req, res) => {
        Mongoose.User.findById(req.session.userId)
            .then(user=>res.send(user))
    });

    app.post('/api/cabinet/user/save', passportLib.isLogged, (req, res) => {
        logger.info(req.body)
        Mongoose.User.findById(req.session.userId)
            .then(user=>{
                user.photo_url = req.body.avatar;
                user.first_name = req.body.nick;
                user.save();
                res.send(user)
                app.locals.wss.clients.forEach(function each(client) {
                    client.send(JSON.stringify({action:"user-profile", player:user._id, userName : user.first_name}));
                });
            })
    });

    app.post('/api/cabinet/update/default-group/:gid', passportLib.isLogged, (req, res) => {
        if (!Mongoose.Types.ObjectId.isValid(req.params.gid)) return res.sendStatus(400);
        Mongoose.User.findById(req.session.userId)
            .then(user => {
                user.group = req.params.gid;
                user.save();
                res.sendStatus(200)
            })
    });


};
