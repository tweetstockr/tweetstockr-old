(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('headerController', headerController);

  function headerController ($scope, userService) {
    userService.getProfile(
      function (data) {

        var user = data.user.twitter;

        $scope.username = user.displayName;
        $scope.balance = data.balance;

        // These are not being used yet...
        $scope.profile_image_thumb = user.profile_image_normal;
        $scope.twitter_url = 'https://twitter.com/' + user.username;

      }, function (error) {
        console.log('User: ', error);
    });
  }
})();
