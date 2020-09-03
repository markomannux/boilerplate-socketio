'use strict';

require('dotenv').config();

const express     = require('express');
const session     = require('express-session');
const bodyParser  = require('body-parser');
const fccTesting  = require('./freeCodeCamp/fcctesting.js');
const auth        = require('./app/auth.js');
const routes      = require('./app/routes.js');
const mongo       = require('mongodb').MongoClient;
const passport    = require('passport');
const cookieParser= require('cookie-parser')
const app         = express();
const http        = require('http').Server(app);
const sessionStore= new session.MemoryStore();
const io          = require('socket.io')(http);
const passportSocketIo = require('passport.socketio');

const cors = require('cors');
app.use(cors());


fccTesting(app); //For FCC testing purposes

app.use('/public', express.static(process.cwd() + '/public'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'pug')

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  key: 'express.sid',
  store: sessionStore,
}));

io.use(passportSocketIo.authorize({
  cookieParser: cookieParser,
  key: 'express.sid',
  secret: process.env.SESSION_SECRET,
  store: sessionStore
}))


mongo.connect(process.env.DATABASE, (err, client) => {
    if(err) console.log('Database error: ' + err);
  
    auth(app, client);
    routes(app, client);
      
    http.listen(process.env.PORT || 3000);

    let currentUsers = 0;  
    //start socket.io code  
    io.on('connection', socket => {
      console.log(`user ${socket.request.user.name} connected`);
      
      ++currentUsers;
      io.emit('user', {
        name: socket.request.user.name,
        currentUsers,
        connected: true
      });

      socket.on('disconnect', () => {
        --currentUsers;
        io.emit('user', {
          name: socket.request.user.name,
          currentUsers,
          connected: false
        });
      })
    })
  

    //end socket.io code
  
  
});
