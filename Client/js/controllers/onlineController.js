
onlineControllerModule.controller('onlineController', ['$scope', '$rootScope', 'onlineService', function ($scope, $rootScope, onlineService) {
  $scope.onlineNameList = [];
  $scope.myUsername = onlineService.myUsername;
  $scope.displayNote = {
    successMessage: onlineService.successMessage,
    savingError: onlineService.savingError,
  };
  $scope.sessionId =  socket.id;
  $scope.gravatarImageURL = generateGravatarImageURL($scope.myUsername, 80);

  const updateUsernameSaving = () => {
    $rootScope.myUsername = $scope.myUsername;
    $rootScope.sessionId = $scope.sessionId;
    $rootScope.gravatarImageURL = $scope.gravatarImageURL;
  };

  updateUsernameSaving();

  const updateOnlineList = (callback) => {
    onlineService.getOnlineUsernames().then((data) => {
      $scope.onlineNameList = data;
      if (callback) callback(data && data.length || 0);
    });
  };

  /**
   * Initial fetch of current online list after loading the page
   * Temporarily set the username to a preset name
   * However, user still needs to save it to be able to create a connection
   */
  updateOnlineList((numberOfOnlineConnection) => {
    if (!$rootScope.myUsername) {
      $scope.myUsername = `Guest - ${+numberOfOnlineConnection + 1} - ${socket.id.substr(0, 5)}`;
    }
  });

  /**
   * Clear message and warning after loading the page
   */
  onlineService.clearMessage();

  /**
   * Set up notification services
   */
  onlineService.setUpNotification(socket, $scope.sessionId);

  $scope.saveUsername = (username) => {
    onlineService.saveUsername(username);
    updateOnlineList();
    updateUsernameSaving();
    // $scope.myUsername = myUsername;
    // $scope.saveSuccess = true;
  };


  $scope.generateGravatarImageURL = (username, size) => {
    return generateGravatarImageURL(username, size);
  };

  /**
   * Watch for the change of any new success or error message
   */
  $scope.$watchGroup([
    function() {
      return onlineService.successMessage;
    },
    function() {
      return onlineService.savingError;
    }
  ], function(newValues) {
    $scope.displayNote = {
      successMessage: newValues && newValues[0],
      savingError: newValues && newValues[1],
    }
  });

  /**
   * Open socket connection to keep the list of online username updated
   */
  socket.on('fetch current online list', function(data) {
    $scope.onlineNameList = data;
    // Apply the change. Otherwise, the new change won't be updated immediately
    $scope.$apply();
  });
}]);


