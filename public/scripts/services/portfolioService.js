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
          withCredentials: true
        })
        .then(function successCallback(response) {

          if (response.data.redirect_to) {
            window.location = 'http://localhost:4000' + response.data.redirect_to;
          }

          onSuccess(response);
        }, function errorCallback(response) {
          onSuccess(response);
        });
      }
    }
  }
})();
