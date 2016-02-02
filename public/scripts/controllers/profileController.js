(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('profileController', profileController);

  function profileController ($scope, userService, networkService) {
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

      networkService.postAuth(
        'http://localhost:4000/reset',
        {},
        function successCallback(response){
          if (response.message) {
            alert(response.message);
          }
        },
        function errorCallback(response){
          if (response.message) {
            alert(response.message);
          }
        });

    }
  }
})();
