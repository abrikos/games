import Mongoose from "server/db/mongoose";

async function init() {
    //Mongoose.User.find()    .then(g=>console.log(g))

    Mongoose.Referral.deleteMany({}).then(console.log)
    Mongoose.User.deleteMany({}).then(console.log)
    Mongoose.Group.deleteMany({}).then(console.log);
    Mongoose.Purchase.deleteMany({}).then(console.log);
    Mongoose.Message.deleteMany({}).then(console.log);

    //Mongoose.connection.close()
}

init()
