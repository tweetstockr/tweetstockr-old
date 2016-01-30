(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('profileController', profileController);

  function profileController ($scope, userService) {

      userService.getProfile(
        function(success){
          $scope.thisIsTheProfile = success;
        }, function(error){
          $scope.thisIsTheProfile = error;
      });
  }

})();
