
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

/*
    Global utility functions
 */

function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Generate the hash for fetching the gravatar image
 * @param username {string} This session username
 * @returns {*} ``undefined`` if this is not a valid email, otherwise return
 * the valid gravatar email hash
 */
function generateGravatarHash(username) {
  if (!validateEmail(username)) {
    return null;
  }
  return CryptoJS.MD5(username.trim().toLowerCase());
}

/**
 * Generate the gravatar image URL, using a username as the input
 * @param username {string} this session username
 * @param size {number} The size of the image. Default is 200
 * @returns {*} ``null`` if username is not a valid email address; otherwise, return
 * the gravatar image URL that represents this username
 */
function generateGravatarImageURL(username, size = 200) {
  const hash = generateGravatarHash(username);
  if (!hash) return null;
  return `https://www.gravatar.com/avatar/${hash}?size=${size}`;
}