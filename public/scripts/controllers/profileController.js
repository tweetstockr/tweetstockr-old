(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('profileController', profileController);

  function profileController ($rootScope, $scope, userService, Notification) {
    $rootScope.updateCurrentUser();
    $scope.loading = false;

    $scope.resetAccount = function () {
      userService.resetAccount(
        function successCallback(response) {
          $scope.loading = true;
          
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
  }
})();
