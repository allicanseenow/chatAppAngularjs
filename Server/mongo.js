const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/chatApp');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', () => {
  console.log('db connected');
});

/**
 * Conversation Model
 */

const conversationSchema = mongoose.Schema({
  user1: {
    type: String,
    required: true,
  },
  user2: {
    type: String,
    required: true,
  },
});

const conversationModel = mongoose.model('Conversation', conversationSchema);

// const aConversation = new conversationModel({ user1: 'user 1', user2: 'user 2'});
// aConversation.save((err, doc) => {
//   if (err) throw err;
//   console.log('hello', doc)
// });

/**
 * Message schema
 */



module.exports = {
  conversationModel,

};