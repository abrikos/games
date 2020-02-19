import User from "server/db/models/Model-User";
import Referral from "server/db/models/Model-Referral";
import Message from "server/db/models/Model-Message";
import Filler from "server/db/models/Model-Filler";
import Log from "server/db/models/Model-Log";
import poker from "server/db/models/Model-Poker";
import Table from "server/db/models/Model-Table";

const mongoose = require("mongoose");
mongoose.set('useCreateIndex', true);
// подключение
console.log('Mongoose connect...');
mongoose.connect("mongodb://localhost:27017/games", {useNewUrlParser: true, useUnifiedTopology: true});
console.log('Mongoose connected!');
//mongoose.connect("mongodb://108.160.143.119:27017/minterEarth", {useNewUrlParser: true});

const Mongoose = {
    close:function (cb){
        mongoose.disconnect(cb)
    },
    Types: mongoose.Types,
    connection: mongoose.connection,
    checkOwnPassport: function (model, passport) {
        if (!passport) return false;
        return JSON.stringify(passport.user._id) === JSON.stringify(model.user.id);
    },
    checkOwnCookie: function (model, cookie) {
        if (!cookie) return false;
        if (!cookie.length) return false;
        return cookie.indexOf(model.cookieId) !== -1;
    },
    User, Referral, Message, Filler, Log, poker, Table

};
export default Mongoose;
