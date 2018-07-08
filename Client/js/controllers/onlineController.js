
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
      if (response.error) {
        onlineService.savingError = response.error;
        onlineService.successMessage = '';
      }
      else {
        onlineService.myUsername = myUsername;
        onlineService.successMessage = response && response.successMessage || '';
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
    console.log('run this ')
    onlineService.getOnlineUsernames().then((data) => {
      $scope.onlineNameList = data;
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


