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

    $scope.joysticketLogin = function() {
      userService.joysticketLogin(
        function successCallback(response){
          if(response.url){
            window.location.href = response.url;
          }
        },
        function errorCallback(response){
          console.log(response);
        }
      );
    };

    $scope.joysticketLogout = function() {
      userService.joysticketLogout(
        function successCallback(response){
          if(response.url){
            window.location.href = response.url;
          }
        },
        function errorCallback(response){
          console.log(response);
        }
      );
    };
  }
})();
