'use strict';
import bot from "server/lib/bot";
import websocket from "server/lib/websocket";

require('dotenv').config();
const fs = require('fs');
const session = require('express-session');
const express = require('express');
const http = require('http');
const uuid = require('uuid');
const passport = require('passport');
//const MongoStore = require('connect-mongo')(session);
const WebSocket = require('ws');
//const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');

const app = express();
const map = new Map();

//
// We need the same instance of the session parser in express and
// WebSocket server.
//
const sessionParser = session({
    saveUninitialized: false,
    secret: '$eCuRiTy',
    resave: false
});

//
// Serve static files from the 'public' folder.
//
app.use(express.static('public'));
//app.use(sessionParser);
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());


/*
app.use(session({
    key: 'sesscookiename',
    secret: 'keyboard sadasd323',
    resave: false,
    cookie: {_expires: 60000000},
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection: mongoose.connection})
}));
*/


app.get('/api',(req,res)=>{
    res.send({ok:'OJ'})
})

app.post('/login', function(req, res) {
    //
    // "Log in" user and set userId to session.
    //
    const id = uuid.v4();

    console.log(`Updating session for user ${id}`);
    req.session.userId = id;
    res.send({ result: 'OK', message: 'Session updated' });
});

app.delete('/logout', function(request, response) {
    const ws = map.get(request.session.userId);

    console.log('Destroying session');
    request.session.destroy(function() {
        if (ws) ws.close();

        response.send({ result: 'OK', message: 'Session destroyed' });
    });
});

fs.readdirSync(__dirname + '/controllers').forEach(function (file) {
    if(file.substr(-3) === '.js') {
        require(__dirname + '/controllers/' + file).controller(app);
    }
});


//
// Create HTTP server by ourselves.
//
const server = http.createServer(app);
const wss = new WebSocket.Server({ clientTracking: false, noServer: true });

server.on('upgrade', function(request, socket, head) {
    console.log('Parsing session from request...');
    //console.log(request.session.userId)
    sessionParser(request, {}, () => {
        console.log(request.session)
       /* if (!request.session.userId) {
            socket.destroy();
            return;
        }*/

        console.log('Session is parsed!');

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
server.listen(3005, function() {
    console.log('Listening on http://localhost:8080');
});
