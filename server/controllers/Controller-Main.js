import Mongoose from "server/db/mongoose";

const passportLib = require('server/lib/passport');
const passport = require('passport');
const logger = require('logat');

module.exports.controller = function (app) {

    app.post('/api/status', (req, res) => {
        res.send({ok: 200})
    });

    app.post('/api/loginFail', (req, res) => {
        res.send({error: "Login fail"})
    });

    app.post('/api/logout', (req, res) => {
        req.session.destroy(function (err) {
            res.send({ok: 200})
        });
    });

    function addReferral(parent, req){
        if(parent.referrals.includes(req.session.userId)) return;
        parent.referrals.push(req.session.userId)
        parent.save()
            //.then(console.log)
            //.catch(console.log)
    }

    app.get('/api/invite/:id', (req, res) => {
        if (!Mongoose.Types.ObjectId.isValid(req.params.id)) return res.redirect('/');
        Mongoose.User.findById(req.params.id)
            .then(parent => {
                if (req.session.passport) {
                    addReferral(parent, req);
                    res.redirect('/cabinet')
                } else {
                    res.cookie('parentUser', parent.id, {maxAge: 900000, httpOnly: true});
                    return res.redirect('/login');
                }
            })

    });

    app.post('/api/site-info', (req, res) => {
        res.send({
            site: process.env.SITE,
            botName: process.env.BOT_NAME
        })
    });


    app.get('/api/login/telegram', passport.authenticate('telegram'), async (req, res) => {
        if (req.cookie && Mongoose.Types.ObjectId.isValid(req.cookie.parentUser)) {
            Mongoose.User.findById(req.cookie.parentUser)
                .then(parent => {
                    addReferral(parent, req);
                })
        }
        res.redirect('/cabinet')
    });

    app.post('/api/login/test', passport.authenticate('test'), (req, res) => {
        res.send({ok: 200})
    });


    app.post('/api/isAuth', passportLib.isLogged, async (req, res) => {
        Mongoose.User.findById(req.session.userId)
            .then(user => res.send(user))
            .catch(error => {
                logger.error(error.message)
                res.sendStatus(500)
            })

    });


};
