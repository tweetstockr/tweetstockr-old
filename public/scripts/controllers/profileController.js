(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('profileController', profileController);

  function profileController ($rootScope, $scope, userService) {

    $rootScope.updateCurrentUser();


    $scope.resetAccount = function () {

      userService.resetAccount(
        function successCallback(response){
          if (response.message)
            alert(response.message);
        },
        function errorCallback(response){
          if (response.message)
            alert(response.message);
        });
    }
  }
})();
