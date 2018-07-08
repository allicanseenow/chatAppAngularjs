const onlineControllerModule = angular.module('onlineControllerModule', []);

onlineControllerModule.factory('onlineService', ['$http', '$location', '$rootScope', function($http, $location, $rootScope) {
  const onlineService = {};
  onlineService.myUsername = '';
  onlineService.successMessage = '';
  onlineService.savingError = null;


  onlineService.onlineNameList = [];

  /**
   * Promise to fetch the list of online users
   * @returns {Promise|*|PromiseLike<T>|Promise<T>} A promise containing the current online username list
   */
  onlineService.getOnlineUsernames = () => {
    return $http.get(`http://localhost:3000/fetch-online-list?sessionId=${socket.id}`)
      .then((res) => {
        return res.data;
      }, (res) => {
        throw res.data;
      });
  };

  /**
   * Create a username if this session ID hasn't created one
   * Or change the username into a new one if this session ID has created one before
   * @param myUsername {string} The new username to be created/changed into
   */
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

  /**
   * Clear all success or error messages if there are any
   */
  onlineService.clearMessage = () => {
    onlineService.successMessage = '';
    onlineService.savingError = null;
  };

  /**
   * Set up notification for events emitted from the server
   * @param socket This session socket
   * @param myId {string} my current session ID
   */
  onlineService.setUpNotification = (socket, myId) => {
    if (Notification.permission === 'granted') {
      socket.on('MESSAGE RECEIVED', (data) => {
        // Only display this notification on main page
        if ($location.path() === '/') {
          const { message, messageId } = data;
          if (!message || !messageId) return;
          const { senderId, senderName } = message;
          // Display notification when someone else is messaging me
          if (senderId !== myId) {
            console.log('Creating a notification----');
            const title = `New message from ${senderName}`;
            const notification = new Notification(title, {
              tag: 'MESSAGE SENT TAG',
              body: `"${ message && message.message || 'Empty message' }"`,
            });
            notification.onclick = (event) => {
              event.preventDefault();
              notification.close();
              $rootScope.$apply(function() {
                $location.url(`/chat/${senderName}?receiverId=${senderId}`);
              });
            };
          }
        }
      });
    }
  };

  return onlineService;
}]);