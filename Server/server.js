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
  let tempData;
  socket.on('user enter name', (data, callback) => {
    console.log('here we go in the SERVER ', data)
    if (data) {
      tempData = {
        username: data.newName,
        sessionId: socket.id,
      };

      // Find from the list of online usernames
      // If this username is not found, return -1. Otherwise, return the index of this username.
      const thisUsernameIndex =  _.findIndex(connections, (connection) => {
        console.log('connection', connection)
        console.log('tempData', tempData)
        return connection.sessionId === tempData.sessionId;
      });

      console.log('thisUsernameIndexis ', thisUsernameIndex)
      // If this username has already existed, check if this username is created by this session_id
      if (thisUsernameIndex !== -1) {
        if (connections[thisUsernameIndex].sessionId === tempData.sessionId) {
          connections[thisUsernameIndex] = tempData;
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
      }
    }
    console.log("tempDatai AFTERALL is '", tempData)
    console.log("connections AFTERALL is '", connections)
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
    const index = connections.indexOf(tempData);
    if (index !== -1) connections.splice(index, 1);
    console.log('Disconnected: %s user online', connections.length);
  });
});

app.use((req, res, next) => {
  req.db = db;
  next();
});

app.use((req, res, next) => {

});

app.get('/', (req, res) => {
  // res.sendFile(__dirname + '/index.html');
});

app.get('/fetch-online-list', (req, res) => {
  res.json(connections);
});


server.listen(3000, () => {
  console.log('listening on *:3000');
});