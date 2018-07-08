
const socket = io.connect('http://localhost:3000');

const app = angular.module('chatApp', ['ngRoute', 'onlineControllerModule', 'chatControllerModule']);

app.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'views/OnlinePanel.html',
      controller: 'onlineController',
    })
    .when('/chat/:username', {
      templateUrl: 'views/Chat.html',
      controller: 'chatController',
    })
    .otherwise({
      redirectTo: '/',
    });
});

/**
 * Request browser permission to invoke notifications
 */
(function requestDesktopNotificationPermission(){
  if(Notification && Notification.permission === 'default' || Notification.permission === 'denied') {
    Notification.requestPermission(function (permission) {
      if(!('permission' in Notification)) {
        Notification.permission = permission;
      }
    });
  }
})();