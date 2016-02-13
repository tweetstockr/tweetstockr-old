(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('rankingController', rankingController);

  function rankingController ($scope, leaderboardService) {
    $scope.loading = false;
    
    leaderboardService.getRanking(
      function onSuccess(response) {
        $scope.rankingList = response;
        $scope.loading = true;
      },
      function onError(response) {
        console.log('error: ', JSON.stringify(response));
      }
    );
  }
})();
