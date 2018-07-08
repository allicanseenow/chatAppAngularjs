
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
 *
 * NOTE: self-invoking function makes it easy to understand its purpose via reading its name
 */
(function requestDesktopNotificationPermission(){
  if(Notification && Notification.permission === 'default' || Notification.permission === 'denied') {
    Notification.requestPermission(function (permission) {
      if (Notification.permission !== permission) {
        Notification.permission = permission;
      }
    });
  }
})();