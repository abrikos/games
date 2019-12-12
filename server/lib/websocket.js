import Mongoose from "server/db/Mongoose";
const logger = require('logat');
const WebSocket = require('ws');
require('dotenv').config();
//const wss = new WebSocket.Server({port: process.env.SERVER_PORT * 1 + 1000});

export default function websocket(wss) {
    console.log('ws port', wss.options.port);

    function adapt(obj){
        return JSON.stringify(obj)
    }

    wss.on('connection', function connection(ws, request) {
        //console.log('CONNECTED');
        ws.on('message', function incoming(received) {
            let data;
            try{
                data = JSON.parse(received);
            }catch (e) {
                return ws.send(adapt({error: e.error}));
            }
            console.log(data)
            data.xxx= new Date();
            ws.send(adapt(data))
            sendAll({br:444444})
        });
    });

    function sendAll (message) {
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(adapt(message));
            }
        });
    }
}
