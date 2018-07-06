
const chatControllerModule = angular.module('chatControllerModule', []);

chatControllerModule.factory('chatService', function($http) {
  console.log('start service')
  const chatService = {
    newMessage: '',
  };

  /**
   * Get the conversation between "from" and "to"
   * @param from this username
   * @param to the other username of the conversation
   * @returns {*}
   */
  chatService.getConversation = (from, to) => {
    return $http.get(`http://localhost:3000/get-coversation?from=${from}&to=${to}`)
      .then((res) => {
        return res.data;
      }, (res) => {
        throw res.data;
      });
  };

  chatService.setUpSocketTransmission = (socket) => {
    let sendMessageToChatFromUser;
    let sendTypingFromUser;

    console.log('hello service here ')

    /**
     * When a user is notified that his/her message has been successfully transferred
     */
    socket.on('MESSAGE SENT', (data) => {

    });

    /**
     * When user receives a new message broadcast from the server
     * { senderId, receiverId, message, senderName }
     */
    socket.on('MESSAGE RECEIVED', (data) => {
      console.log('data received --- ', data);
    });

    /**
     * When user is notified that the other person is typing
     */
    socket.on('IS TYPING', () => {

    });
  };

  /**
   * Send a message
   * @param message Message to be send
   * @param receiverId socketId of the receiver
   * @param senderName name of this user
   */
  chatService.sendMessage = (message = '', receiverId, senderName, senderId) => {
    $http.post(`http://localhost:3000/send-message`, {
      message,
      receiverId,
      senderName,
      senderId,
    }).then((res) => {

    }, (res) => {
      throw res.data;
    });
  };

  chatService.resetNewMessage = () => {
    chatService.newMessage = '';
  };

  return chatService;
});