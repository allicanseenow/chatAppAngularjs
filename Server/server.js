const _ = require('lodash');
// const db = require('./mongo');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid/v4');
const app = require('express')();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(morgan('combined'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const server = require('http').Server(app);
const io = require('socket.io')(server);

const connections = [];

io.on('connection', (socket) => {
  /**
   * Store this connection's username and socketId
   */
  let userData;

  /**
   * If any change occurs to the current online username list, broadcast the change to all clients
   */
  const broadcastOnlineList = () => {
    io.emit('fetch current online list', connections);
  };

  const broadcastUserHasLeft = ({ username, sessionId }) => {
    io.emit('USER HAS LEFT', { leavingUser: { username, sessionId }});
  };

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
        broadcastOnlineList();
        userData = tempData;
      }
    }
    console.log('Connected: %s user online', connections.length);
  });

  // socket.on('chat message', function(msg) {
  //   io.emit('chat message', msg);
  // });
  //
  // socket.on('send message', (data) => {
  //   io.emit('new message', {
  //     msg: data,
  //   });
  // });

  socket.on('SEND MESSAGE', (data, callback) => {
    callback(true);
    socket.emit()
  });

  // If a person disconnects, remove this from online list
  socket.on('disconnect', function() {
    const index = connections.indexOf(userData);
    if (index !== -1) {
      const { username, sessionId } = connections[index];
      connections.splice(index, 1);
      broadcastUserHasLeft({ username, sessionId });
    }
    // If someone is longer online, broadcast this to other people
    broadcastOnlineList();
    console.log('Disconnected: %s user online', connections.length);
  });
});

app.use((req, res, next) => {
  // req.db = db;
  req.io = io;
  next();
});

app.get('/', (req, res) => {
  // res.sendFile(__dirname + '/index.html');
});

/**
 * Find the username of one using the session ID
 */
app.get('/get-receiver-name', (req, res) => {
  const { query } = req;
  const { receiverId } = query;
  const connection = _.find(connections, (connection) => {
    return connection.sessionId === receiverId;
  });
  if (!connection) {
    return res.status(400).send({ error: 'Bad request'});
  }
  else {
    return res.status(200).send({ username: connection.username });
  }
});

app.get('/fetch-online-list', (req, res) => {
  res.json(connections);
});

/**
 * API used when a client sends a private message to another person. The API broadcasts
 * the message to both clients
 */
app.post('/send-message', (req, res) => {
  const { io, body } = req;
  const { message, receiverId, senderName, senderId } = body;
  if (!receiverId || !senderId) {
    return res.status(400).send({ Error: 'Bad request' });
  }
  _.forEach([senderId, receiverId], (room) => {
    io.to(room).emit('MESSAGE RECEIVED', {
      message: {
        senderId, receiverId, message, senderName,
      },
      messageId: uuid(),
    });
  });
  return res.status(200).send({});
});

/**
 * Broadcast to the other person of the conversation to notify that this person is typing
 */
app.post('/signify-is-typing', (req, res) => {
  const { io, body } = req;
  const { isTyping, receiverId, senderName, senderId } = body;
  io.to(receiverId).emit('IS TYPING', { isTyping, typingPersonName: senderName, typingPersonId: senderId });
  return res.status(200).send({});
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});