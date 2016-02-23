(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .factory('marketService', marketService);

  function marketService ($rootScope, CONFIG, networkService) {
    return {
      buy: function (name, quantity, onSuccess, onError) {
        networkService.postAuth(
          CONFIG.apiUrl + '/trade/buy',
          {stock: name, amount: quantity},
          function successCallback(response) {
            $rootScope.updateCurrentUser();
            onSuccess(response);
          },
          function errorCallback(response) {
            onError(response);
          }
        );
      },
      sell: function(shareId, onSuccess, onError) {
        networkService.postAuth(
          CONFIG.apiUrl + '/trade/sell',
          { trade : shareId },
          function successCallback(response){
            $rootScope.updateCurrentUser();
            onSuccess(response);
          },
          function errorCallback(response) {
            onError(response);
          }
        );
      },
      getRound: function(onSuccess, onError){
        networkService.get(
          CONFIG.apiUrl + '/round',
          function successCallback(response){
            onSuccess(response);
          },
          function errorCallback(response){
            onError(response);
          }
        );
      }
    };
  }
})();
