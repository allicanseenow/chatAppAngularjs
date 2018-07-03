
const onlineControllerModule = angular.module('onlineControllerModule', []);

onlineControllerModule.factory('onlineService', function($http) {
  const onlineService = {};
  onlineService.myUsername = '';
  onlineService.saveSuccess = false;
  onlineService.savingError = null;


  onlineService.onlineNameList = [];

  // Promise to fetch the list of online users
  onlineService.getOnlineUsernames = () => {
    return $http.get(`http://localhost:3000/fetch-online-list`)
      .then((res) => {
        return res.data;
      }, (res) => {
        throw res.data;
      });
  };

  onlineService.saveUsername = (myUsername) => {
    console.log('BEFORE  ___--- About to change name')
    socket.emit('user enter name', { newName: myUsername }, (response) => {
      console.log('About to change name')
      if (response.error) {
        onlineService.savingError = response.error;
      }
      else {
        onlineService.myUsername = myUsername;
        onlineService.saveSuccess = true;
        onlineService.savingError = null;
        console.log('change name yay')
      }
    });
  };

  return onlineService;
});

onlineControllerModule.controller('onlineController', ['$scope', 'onlineService', function ($scope, onlineService) {
  $scope.onlineNameList = [];
  $scope.myUsername = onlineService.myUsername;
  $scope.saveSuccess = onlineService.saveSuccess;
  $scope.savingError = onlineService.savingError;

  const updateOnlineList = () => {
    onlineService.getOnlineUsernames().then((data) => {
      $scope.onlineNameList = data;
      console.log('data i s', data)
    });
  };

  updateOnlineList();

  $scope.saveUsername = (username) => {
    console.log("Hey you");
    onlineService.saveUsername(username);
    updateOnlineList();
    // $scope.myUsername = myUsername;
    // $scope.saveSuccess = true;
  };
}]);


