(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .factory('portfolioService', portfolioService);

  function portfolioService ($http, $rootScope, CONFIG, networkService) {
    return {
      getPortfolio: function (onSuccess, onError) {

        networkService.getAuth(
          CONFIG.apiUrl + '/portfolio',
          function successCallback(response){
            onSuccess(response);
          },
          function errorCallback(response){
            onError(response);
          });

      }

    }
  }
})();
