import Mongoose from "server/db/Mongoose";

export default class Dice extends Mongoose.Table {
    constructor(props) {
        super(props);
        this.game = this.constructor.name
    }


    save() {
        return new Promise((resolve, reject) => {
            if (!this.players.length) {
                return reject('No players')

            }
            super.save()
                .then(resolve)
                .catch(reject)
        })
    }
}
