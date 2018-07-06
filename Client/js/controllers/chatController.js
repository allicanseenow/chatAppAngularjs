
chatControllerModule
  .controller('chatController', ['$scope', '$rootScope', '$location', '$routeParams', 'chatService', function ($scope, $rootScope, $location, $routeParams, chatService) {
    $scope.myUsername = '';
    $scope.sessionId = '';
    $scope.currentText = '';
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
      chatService.sendMessage(message, receiverId, $scope.myUsername, $scope.sessionId);
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