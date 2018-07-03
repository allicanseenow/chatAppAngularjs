
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