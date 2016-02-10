(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .factory('leaderboardService', leaderboardService);

  function leaderboardService (CONFIG, networkService) {
    return {
      getRanking: function (onSuccess, onError) {
        networkService.get(
          CONFIG.apiUrl + '/ranking',
          function successCallback(response) {
            onSuccess(response);
          },
          function errorCallback(response) {
            onError(response);
          }
        );
      }
    };
  }
})();
