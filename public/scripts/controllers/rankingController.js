(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('rankingController', rankingController);

  function rankingController ($scope, leaderboardService) {

    leaderboardService.getRanking(
      function onSuccess(response){
        $scope.rankingList = response;
      },
      function onError(response){
        alert("error >> " + JSON.stringify(response));
      }
    );
  }
})();
