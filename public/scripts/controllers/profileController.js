(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('profileController', profileController);

  function profileController ($rootScope, $scope, userService, Notification) {
    $rootScope.updateCurrentUser();

    $scope.resetAccount = function () {
      userService.resetAccount(
        function successCallback(response) {
          if (response.message) {
            Notification.success(response.message);
          }
        },
        function errorCallback(response) {
          if (response.message) {
            Notification.error(response.message);
          }
        }
      );
    };

    $scope.logout = function () {

      userService.logout(
        function successCallback(response) {

        },
        function errorCallback(response) {
          if (response.message) {
            Notification.error(response.message);
          }
        }
      );

    };

  }
})();
