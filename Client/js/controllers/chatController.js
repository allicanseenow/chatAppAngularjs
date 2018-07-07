
chatControllerModule
  .controller('chatController', ['$scope', '$rootScope', '$location', '$routeParams', 'chatService', function ($scope, $rootScope, $location, $routeParams, chatService) {
    $scope.myUsername = '';
    $scope.sessionId = '';
    $scope.message = {
      currentText: chatService.newMessage.currentText,
      allMessages: chatService.newMessage.allMessages,
    };
    console.log('$scope.message is ',  $scope.message)
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
      chatService.sendMessage(message, receiverId, $scope.myUsername, $scope.sessionId);
    };


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
        $scope.message.currentText = data.currentText;
        $scope.message.allMessages = data.allMessages
      });
    });


    $scope.$watch('$scope.message.currentText')


    chatService.setUpSocketTransmission(socket);

  }]);