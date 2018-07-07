
chatControllerModule
  .controller('chatController', ['$scope', '$rootScope', '$location', '$routeParams', 'chatService', function ($scope, $rootScope, $location, $routeParams, chatService) {
    $scope.myUsername = '';
    $scope.sessionId = '';
    $scope.otherPersonName = '';
    $scope.message = {
      currentText: chatService.newMessage.currentText,
      allMessages: chatService.newMessage.allMessages,
      otherPersonIsTyping: false,
    };
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
     * Get the receiver name
     */
    const getReceiverNameViaID = () => {
      chatService.getReceiverName(receiverId)
        .then((res) => {
          const { username } = res.data;
          $scope.otherPersonName = username;
        }, (res) => {
          throw res.data;
        });
    };

    getReceiverNameViaID();

    /**
     * Send a message to a receiverId
     * @param message
     */
    $scope.sendMessage = (message) => {
      chatService.sendMessage(message, receiverId, $scope.myUsername, $scope.sessionId);
    };

    /**
     * Call an API to signify if this person is typing
     */
    $scope.isTyping = () => {
      chatService.isTyping();
    };

    // $rootScope.$watchGroup([function() {
    //   return chatService.newMessage.allMessages;
    // }], (newMessage, oldMessage) => {
    //   $scope.message.allMessages = newMessage[0];
    // });

    /**
     * Receive the change broadcast from the service
     * Update the view with the new message that the controller has received
     */
    $scope.$on('SEND MESSAGE FROM CHAT SERVICE', (event, data) => {
      $scope.$apply(function() {
        if (!data.keepCurrentText) $scope.message.currentText = data.currentText;
        $scope.message.allMessages = data.allMessages
      });
    });

    /**
     * Catch the event from chatService, to check if the other person is typing or not
     */
    $scope.$on('OTHER PERSON IS TYPING', (event, { isTyping }) => {
      if ($scope.message.otherPersonIsTyping !== isTyping) {
        $scope.$apply(function() {
          $scope.message.otherPersonIsTyping = isTyping;
        });
      }
    });


    /**
     * Watch for when this person is typing or not and notify the server of the action
     */
    $scope.$watch('message.currentText', (newText, oldText) => {
      /*
          Only emit the event when:
          - newText is different from oldText
          - Either newText or oldText must be an empty string, but not both are
       */
      if ((newText !== oldText) && (!!oldText ^ !!newText)) {
        const isTyping = !!newText;
        chatService.isTyping(isTyping, $scope.sessionId, receiverId, $scope.myUsername);
      }
    });

    chatService.setUpSocketTransmission(socket);

  }]);