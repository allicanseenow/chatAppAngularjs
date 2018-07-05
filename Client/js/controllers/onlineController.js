
const onlineControllerModule = angular.module('onlineControllerModule', []);

onlineControllerModule.factory('onlineService', function($http) {
  const onlineService = {};
  onlineService.myUsername = '';
  onlineService.successMessage = '';
  onlineService.savingError = null;


  onlineService.onlineNameList = [];

  // Promise to fetch the list of online users
  onlineService.getOnlineUsernames = () => {
    return $http.get(`http://localhost:3000/fetch-online-list?sessionId=${socket.id}`)
      .then((res) => {
        return res.data;
      }, (res) => {
        throw res.data;
      });
  };

  onlineService.saveUsername = (myUsername) => {
    console.log('socket id is ', socket.id)
    socket.emit('user enter name', { newName: myUsername }, (response) => {
      console.log('response here is ', response)
      if (response.error) {
        onlineService.savingError = response.error;
        onlineService.successMessage = '';
      }
      else {
        onlineService.myUsername = myUsername;
        onlineService.successMessage = response.successMessage;
        onlineService.savingError = null;
      }
    });
  };

  return onlineService;
});

onlineControllerModule.controller('onlineController', ['$scope', '$rootScope', 'onlineService', function ($scope, $rootScope, onlineService) {
  $scope.onlineNameList = [];
  $scope.myUsername = onlineService.myUsername;
  $scope.displayNote = {
    successMessage: onlineService.successMessage,
    savingError: onlineService.savingError,
  };
  $scope.sessionId =  socket.id;

  const updateUsernameSaving = () => {
    $rootScope.myUsername = $scope.myUsername;
    $rootScope.sessionId = $scope.sessionId;
  };

  updateUsernameSaving();

  const updateOnlineList = () => {
    onlineService.getOnlineUsernames().then((data) => {
      $scope.onlineNameList = data;
      console.log('data i s', data)
    });
  };

  // updateOnlineList();

  $scope.saveUsername = (username) => {
    onlineService.saveUsername(username);
    updateOnlineList();
    updateUsernameSaving();
    // $scope.myUsername = myUsername;
    // $scope.saveSuccess = true;
  };

  $scope.$watchGroup([ onlineService.successMessage, onlineService.savingError ], (newVal) => {
    $scope.displayNote = {
      successMessage: newVal && newVal[0],
      savingError: newVal && newVal[1],
    }
  });

  $scope.$watchGroup([
    function() {
      return onlineService.successMessage;
    },
    function() {
      return onlineService.savingError;
    }
  ], function(newValues) {
    $scope.displayNote = {
      successMessage: newValues[0],
      savingError: newValues[1],
    }
  });

  /**
   * Open socket connection to keep the list of online username updated
   */
  socket.on('fetch current online list', function(data) {
    console.log("here we go", data)
    $scope.onlineNameList = data;
    // Apply the change. Otherwise, the new change won't be updated immediately
    $scope.$apply();
  });
}]);


