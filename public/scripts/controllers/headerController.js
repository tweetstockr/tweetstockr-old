(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('headerController', headerController);

  function headerController ($scope, userService) {
    // userService.getProfile(
    //   function (success) {
    //     var user = success.data.user.twitter;

    //     console.log('User: ', user);

    //     $scope.username = user.displayName;
    //   }, function (error) {
    //     console.log('User: ', error);
    // });
  }
})();