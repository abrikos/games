'use strict';
import bot from "server/lib/bot";
import websocket from "server/lib/websocket";

require('dotenv').config();
const fs = require('fs');
const session = require('express-session');
const express = require('express');
const http = require('http');
const passport = require('passport');
const MongoStore = require('connect-mongo')(session);
const WebSocket = require('ws');
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();
const wss = new WebSocket.Server({ clientTracking: true, noServer: true });
app.locals.wss = wss;
const sessionParser = session({
    saveUninitialized: false,
    secret: '$eCuRiTy',
    resave: false,
    store: new MongoStore({mongooseConnection: mongoose.connection})
});

app.use(function (req, res, next) {
    res.wss = wss;
    next();
});


app.use(sessionParser);
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


fs.readdirSync(__dirname + '/controllers').forEach(function (file) {
    if(file.substr(-3) === '.js') {
        require(__dirname + '/controllers/' + file).controller(app);
    }
});


//
// Create HTTP server by ourselves.
//
const server = http.createServer(app);




server.on('upgrade', function(request, socket, head) {
    sessionParser(request, {}, () => {
       /* if (!request.session.userId) {
            socket.destroy();
            return;
        }*/
        wss.handleUpgrade(request, socket, head, function(ws) {
            wss.emit('connection', ws, request);
        });
    });
});

bot();
websocket(wss);

//
// Start the server.
//
server.listen(process.env.SERVER_PORT, function() {
    console.log('Listening on ' + process.env.SERVER_PORT);
});
