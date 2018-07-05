
const chatControllerModule = angular.module('chatControllerModule', []);

chatControllerModule.factory('chatService', function($http) {
  const chatService = {
    newMessage: '',
    getNewMessage: () => { return chatService.newMessage }
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

    /**
     * When a user is notified that his/her message has been successfully transferred
     */
    socket.on('MESSAGE SENT', (data) => {

    });

    /**
     * When user receives a new message broadcast from the server
     */
    socket.on('MESSAGE RECEIVED', (data) => {

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
   */
  chatService.sendMessage = (message, receiverId, senderName) => {
    if (message) {
      socket.emit('SEND MESSAGE', { message, receiverId, sender: senderName }, (messageSent = false) => {
        console.log('message is sent', messageSent)
        console.log('chatService.newMessage  is outside ', chatService.newMessage )
        console.log('message is outside ', message)
        if (messageSent) {
          console.log('chatService.newMessage  is ', chatService.newMessage )
          console.log('message is ', message)
          chatService.newMessage = message;
        }
      });
    }
  };

  chatService.resetNewMessage = () => {
    chatService.newMessage = '';
  };

  return chatService;
});

chatControllerModule
  .controller('chatController', ['$scope', '$rootScope', '$location', '$routeParams', 'chatService', function ($scope, $rootScope, $location, $routeParams, chatService) {
    $scope.myUsername = '';
    $scope.sessionId = '';
    $scope.currentText = chatService.newMessage;
    $scope.allMessages = [];
    console.log('$location is ', $routeParams)
    const { username, receiverId } = $routeParams;

    /**
     * Verify user has created a username, by checking $rootScope
     * If username is not found, redirect user to the home page
     */
    if (!$rootScope.myUsername) {
      alert('Need to enter username');
      $location.path('/');
    }
    else if (!$rootScope.sessionId) {
      alert('Session expires');
      $location.path('/');
    }
    else if (!receiverId) {
      alert('Need to specify the message receiver');
      window.location = 'http://localhost:8080/#!/';
    }
    $scope.myUsername = $rootScope.myUsername;
    $scope.sessionId = $rootScope.sessionId;

    /**
     * Send a message to a receiverId
     * @param message
     */
    $scope.sendMessage = (message) => {
      chatService.sendMessage(message, receiverId, $scope.myUsername);
    };

    $rootScope.$watch(function() {
      return chatService.newMessage;
    }, (newMessage, oldMessage) => {
      console.log('newMessage in controller ', newMessage);
      if (newMessage && newMessage !== oldMessage) {
        $scope.allMessages.push(newMessage);
        console.log('$scope.allMessages is ', $scope.allMessages);
        chatService.resetNewMessage();
        // $scope.$apply();
      }
    });


    chatService.setUpSocketTransmission(socket);

  }]);