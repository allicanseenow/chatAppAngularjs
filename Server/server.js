const _ = require('lodash');
const db = require('./mongo');
const morgan = require('morgan');
const app = require('express')();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(morgan('combined'));

const server = require('http').Server(app);
const io = require('socket.io')(server);

const users = [];
const connections = [];

io.on('connection', (socket) => {
  /**
   * Store this connection's username and socketId
   */
  let userData;
  socket.on('user enter name', (data, callback) => {
    if (data) {
      const tempData = {
        username: data.newName,
        sessionId: socket.id,
      };

      // Find from the list of online usernames
      // If this username is not found, return -1. Otherwise, return the index of this username.
      const thisUsernameIndex =  _.findIndex(connections, (connection) => {
        return connection.sessionId === tempData.sessionId;
      });

      // If this username has already existed, check if this username is created by this session_id
      if (thisUsernameIndex !== -1) {
        if (connections[thisUsernameIndex].sessionId === tempData.sessionId) {
          connections[thisUsernameIndex] = tempData;
          userData = tempData;
          callback({ error: null });
        }
        else {
          callback({ error: 'Username taken'});
        }
      }
      // If this username hasn't been taken
      else {
        callback({ error: null });
        connections.push(tempData);
        userData = tempData;
      }
    }
    console.log('Connected: %s user online', connections.length);
  });

  socket.on('chat message', function(msg) {
    io.emit('chat message', msg);
  });

  socket.on('send message', (data) => {
    io.emit('new message', {
      msg: data,
    });
  });

  // If a person disconnects, remove this from online list
  socket.on('disconnect', function() {
    const index = connections.indexOf(userData);
    if (index !== -1) connections.splice(index, 1);
    console.log('Disconnected: %s user online', connections.length);
  });
});

app.use((req, res, next) => {
  req.db = db;
  // req.io = io;
  next();
});

app.get('/', (req, res) => {
  // res.sendFile(__dirname + '/index.html');
});

app.get('/fetch-online-list', (req, res) => {
  io.emit('fetch current online list', JSON.stringify(connections));
  res.json(connections);
});


server.listen(3000, () => {
  console.log('listening on *:3000');
});