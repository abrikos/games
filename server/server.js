import websocket from "server/lib/websocket"
import bot from "server/lib/bot"
require('dotenv').config();
const app = require('./app');
const port = process.env.SERVER_PORT;

app.listen(port, 'localhost',function (err) {
    if (err) {
        throw err
    }
    console.log(`server is listening on ${port}...`)
});

bot();
websocket(app);
