(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('headerController', headerController);

  function headerController ($rootScope, $scope, userService) {
    $rootScope.updateCurrentUser = function () {
      userService.getProfile(
        function onSuccess(response) {
          $scope.username = response.user.twitter.displayName;
          $scope.twitterUser = response.user.twitter.username;
          $scope.balance = response.balance;
          $scope.ranking = response.ranking;
          // These are not being used yet...
          $scope.profileImage = response.user.twitter.profile_image;
          $scope.profileImageThumb = response.user.twitter.profile_image_normal;
          $scope.twitterUrl = 'https://twitter.com/' + response.user.twitter.username;
        },
        function onError(data) {
          console.log('Error: ' + data.message);
        }
      );
    };

    $rootScope.updateCurrentUser();
  }
})();
