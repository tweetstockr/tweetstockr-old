(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('profileController', profileController);

  function profileController ($scope, userService, $http) {
    // userService.getProfile(
    //   function (success) {
    //     console.log(JSON.stringify(success));
    //     var user = success.data.user.twitter;
    //
    //     console.log('User: ', user);
    //
    //     $scope.user_photo = user.profile_image;
    //     $scope.user_name = user.username;
    //   }, function (error) {
    //     console.log('User: ', error);
    // });

    $scope.resetAccount = function () {
      $http({
        method: 'POST',
        url: 'http://localhost:4000/reset',
        withCredentials: true
      }).then(function successCallback(response) {

        if (response.data.redirect_to) {
          window.location = 'http://localhost:4000' + response.data.redirect_to;
        }

      }, function errorCallback(error) {
        console.log('Reset Account Error: ', error);
      });
    }
  }
})();
