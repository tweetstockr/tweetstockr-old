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
          $scope.twitter_user = response.user.twitter.username;
          $scope.balance = response.balance;
          $scope.ranking = response.ranking;
          // These are not being used yet...
          $scope.profile_image = response.user.twitter.profile_image;
          $scope.profile_image_thumb = response.user.twitter.profile_image_normal;
          $scope.twitter_url = 'https://twitter.com/' + response.user.twitter.username;

          //TODO: return user rank
          $scope.rank = '79';

        },
        function onError(data) {
          console.log('Error: ' + data.message);
        }
      )

    }

    $rootScope.updateCurrentUser();

  }
})();
