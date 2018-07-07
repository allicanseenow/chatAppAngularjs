
const chatControllerModule = angular.module('chatControllerModule', []);

chatControllerModule.factory('chatService', function($http, $rootScope) {
  const chatService = {
    newMessage: {
      currentText: '',
      allMessages: [],
    }
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
      const { message, messageId } = data;
      const { senderId } = message;
      /**
       * Sometimes, there will be 2 identical events sent to the same socket
       *
       * Find if the message array has already contained the newest message.
       * If the array has already contained the message, we won't add the message to the array
       * to display to users
       *
       * If the array length > 10, only check the last 10 messages of the array to see
       * if the array contains the message (for performance's sake). Otherwise, scan all the array
       *
       * Invoking the function is needed to prevent duplication as sometimes, socket.on will
       * receive 2 events although there is only 1 event to be emitted from the server
       * @returns {boolean} ``true`` if there is a duplication, ``false`` otherwise
       */
      const findDuplicateMessageById = () => {
        return _.findIndex(chatService.newMessage.allMessages, (eachMessage) => {
          return eachMessage.messageId === messageId;
        }, (function() {
          const messageCount = chatService.newMessage.allMessages.length;
          return messageCount > 10 ? messageCount - 10 : 0;
        })()) !== -1;
      };
      // Sometimes, socket.on receives a duplicate of an event emitted from the server
      // This makes sure we won't add a message twice
      if (!findDuplicateMessageById()) {
        chatService.newMessage.allMessages.push(data);
        // If this message is sent by this user, clear the input field
        if (senderId === socket.id) {
          chatService.newMessage.keepCurrentText = false;
          chatService.newMessage.currentText = '';
        }
        else {
          chatService.newMessage.keepCurrentText = true;
        }
        $rootScope.$broadcast('SEND MESSAGE FROM CHAT SERVICE', chatService.newMessage);
      }
    });

    /**
     * When user is notified that the other person is typing
     */
    socket.on('IS TYPING', ({ isTyping }) => {
      $rootScope.$broadcast('OTHER PERSON IS TYPING', { isTyping });
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
      message, receiverId, senderName, senderId,
    }).then((res) => {

    }, (res) => {
      throw res.data;
    });
  };

  /**
   * Signify the other person that I am typing
   * @param isTyping {boolean} Is this person typing
   * @param senderId Session ID of the sender
   * @param receiverId Session ID of the receiver
   * @param senderName Username of the sender's session ID
   */
  chatService.isTyping = (isTyping, senderId, receiverId, senderName) => {
    $http.post(`http://localhost:3000/signify-is-typing`, {
      isTyping, senderId, receiverId, senderName
    });
  };

  return chatService;
});