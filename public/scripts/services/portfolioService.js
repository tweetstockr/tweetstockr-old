(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .factory('portfolioService', portfolioService);

  function portfolioService ($http, $rootScope) {
    return {
      getPortfolio: function (onSuccess, onError) {
        $http({
          method: 'GET',
          url: 'http://localhost:4000/portfolio',
          data: {},
          withCredentials: true
        })
        .then(function successCallback(response) {
          onSuccess(response);
        }, function errorCallback(response) {
          onSuccess(response);
        });
      }
    }
  }
})();
