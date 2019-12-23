import User from "server/db/models/Model-User";
import Referral from "server/db/models/Model-Referral";
import Message from "server/db/models/Model-Message";
import Filler from "server/db/models/Model-Filler";
import Log from "server/db/models/Model-Log";
import Poker from "server/db/models/Model-Poker";
import Site from "server/db/models/Model-Site";
import Pot from "server/db/models/Model-Pot";
import CardSchema from "server/db/models/Model-Card";
/*
import Site from "server/db/models/Model-Site";
import Pot from "server/db/models/Model-Pot";
import Round from "server/db/models/Model-Round";
import Bet from "server/db/models/Model-Bet";
*/

const mongoose = require("mongoose");
mongoose.set('useCreateIndex', true);
// подключение
mongoose.connect("mongodb://localhost:27017/games", {useNewUrlParser: true, useUnifiedTopology: true});
//mongoose.connect("mongodb://108.160.143.119:27017/minterEarth", {useNewUrlParser: true});

const Mongoose = {

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
    User, Referral, Message, Filler, Log, Poker, CardSchema, Site, Pot

};
export default Mongoose;
