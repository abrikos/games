import Mongoose from "server/db/Mongoose";
//const Centrifuge = require("centrifuge");
const logger = require('logat');
const CronJob = require('cron').CronJob;



//mongoose.Transaction.findById('5dc51d7fde99157de21e63ef').then(console.log)
//mongoose.Wallet.find({user:{$ne:null}}).then(console.log)
//mongoose.Transaction.deleteMany({}, console.log);mongoose.Payment.deleteMany({}, console.log);mongoose.Payment.collection.dropAllIndexes(console.log)


//USER ADDRESS
/*
mongoose.Wallet.findOne({address:'0x24918203c53f21ca9c7ace7f6a11749737489675'.toLowerCase()})
    .then(w=>{
        const A = new Configurator(w.network);
        //ADDRESS LOTTERY
        A.crypto.send({address:'0x51db9a536e75d4b52a066bec82af9c584b9fe328', pk: w.seed, amount:0.001})
    })
*/


export default {

    bot: null,

    async run(bot) {

        this.bot = bot;
        const jobs = {};

        jobs.transactions = new CronJob('*/5 * * * * *', async () => {
            Mongoose.Message.find({delivered:false})
                .populate('user')
                .then(messages=>{
                    for(const message of messages){
                        this.bot.sendMessage(message.user.id, message.text, {parse_mode: "Markdown"})
                            .then(status=>{
                                console.log(status)
                                message.delivered = true;
                                message.save()
                            })

                    }
                })



        }, null, true, 'America/Los_Angeles');

    }

}




