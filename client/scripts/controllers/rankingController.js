(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('rankingController', rankingController);

  function rankingController($scope, Ranking) {
    $scope.find = function() {
      Ranking.query(function(ranking) {
        $scope.users = ranking;
      });
    };
  }
})();
