import Mongoose from "server/db/mongoose";
import moment from "moment";
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const TelegramStrategy = require('passport-custom').Strategy;
const logger = require('logat');
const crypto = require('crypto');


passport.use(new LocalStrategy({passReqToCallback: true},
    function (req, username, password, done) {
        Mongoose.User.findOne({username})
            .then(user => {
                if (!user) {
                    return done(null, false, {error: 'username', message: 'Incorrect username.'});
                }
                if (!user.validPassword(password)) {
                    return done(null, false, {error: 'password', message: 'Incorrect password.'});
                }
                if (!user.emailConfirmed) {
                    return done(null, user, {error: 'email-confirm', message: 'Email not confirmed.'});
                }
                //return done(null, null, {error: 'test-endpoint', message: 'TEST WRONG login.'});
                return done(null, user, {});
            })
            .catch(done)
        ;
    }
));

passport.use('test', new TelegramStrategy(function (req, done) {
    Mongoose.User.findOne({id:14278211})
        .then(user=>{
            if (!user) {
                Mongoose.User.create({id:14278211, first_name:'ABR'})
                    .then(user=>done(null, user));
                //return done({status: 403}, false, {error: 'db', message: 'NO USER'});
            }else{
                done(null, user);
            }
        });

}));

passport.use('telegram', new TelegramStrategy(function (req, done) {

    const data = req.query;
    if (checkSignature(data)) {
        Mongoose.User.findOne({id: data.id})
            .then(user => {
                if (!user) {
                    Mongoose.User.create(data)
                        .then(owner=>{
                            //Mongoose.Purchase.create({name: 'My first group', owner});
                            done(null, owner)
                        });
                    //return done({status: 403}, false, {error: 'db', message: 'NO USER'});
                }else{
                    const {id, ...rest} = data;
                    for(const field of Object.keys(rest)){
                        user[field] = rest[field];
                    }
                    user.save();
                    done(null, user);
                }

            })
    } else {
        done(null, false, {error: 'wrong-data', message: 'Wrong POST data.'});
    }
}));


function checkSignature({hash, ...data}) {
    console.log(hash, data)
    const TOKEN = process.env.BOT_TOKEN;
    const secret = crypto.createHash('sha256')
        .update(TOKEN)
        .digest();
    const checkString = Object.keys(data)
        .sort()
        .map(k => (`${k}=${data[k]}`))
        .join('\n');
    const hmac = crypto.createHmac('sha256', secret)
        .update(checkString)
        .digest('hex');
    return hmac === hash;
}


passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

module.exports = {
    initialize: passport.initialize,
    session: passport.session,
    checkSignature,

    isLogged: function (req, res, next) {
        if (req.session.passport) {
            //console.log('AUTHENTICATED')
            req.session.userId = req.session.passport.user._id
            return next()
        } else {
            //hconsole.error('DENIED')
            res.sendStatus(401);
        }
    },

    loginLocal: passport.authenticate('local'),
    loginGithub: passport.authenticate('github'),

}
