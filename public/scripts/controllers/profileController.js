(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('profileController', profileController);

  function profileController ($scope, userService) {
    userService.getProfile(
      function (success) {
        var user = success.data.user.twitter;

        console.log('User: ', user);

        $scope.user_photo = user.profile_image;
        $scope.user_name = user.username;
      }, function (error) {
        console.log('User: ', error);
    });
  }
})();
