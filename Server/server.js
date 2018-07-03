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
      // If this username with this sessionId is not found, return -1. Otherwise, return the index of the username this sessionId has.
      const thisSessionIdIndex =  _.findIndex(connections, (connection) => {
        return connection.sessionId === tempData.sessionId;
      });

      // Check if the username has been taken. If it has, return it index. Otherwise, return -1
      const newUsernameIndex = _.findIndex(connections, (connection) => {
        return connection.username === tempData.username;
      });

      // Check if the new username is being used (by current sessionId or someone else). If it is, current sessionId cannot switch to this username
      // If it is being used
      if (newUsernameIndex !== -1) {
        callback({ error: 'Username has been taken! '});
      }
      // If it is not being used
      else {
        // Check if this sessionId has already created a username or not and save the username in the array "connections".
        // If it has, modify the object in the array to have a new username

        let successMessage = null;
        // If this sessionId has already created a username
        if (thisSessionIdIndex !== -1) {
          connections[thisSessionIdIndex] = tempData;
          successMessage = 'Username of this connection has been changed';
        }
        // If this sessionId hasn't created a username, add the username to the array "connections"
        else {
          connections.push(tempData);
          successMessage = 'New username has been created';
        }
        callback({ error: null, successMessage });
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
  // const userSessionId = req.query.sessionId;
  // Add attribute
  // const filteredConnection = _.map(connections, (connection) => {
  //   if (connection.sessionId === userSessionId) {
  //     connection.isUser = true;
  //   }
  //   return connection;
  // });
  io.emit('fetch current online list', JSON.stringify(connections));
  res.json(connections);
});


server.listen(3000, () => {
  console.log('listening on *:3000');
});