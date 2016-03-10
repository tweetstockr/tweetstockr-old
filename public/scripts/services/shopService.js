(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .factory('shopService', shopService);

  function shopService (CONFIG, networkService) {
    return {
      getProducts: function (onSuccess, onError) {
        networkService.getAuth(
          CONFIG.apiUrl + '/shop',
          function successCallback(response) {
            onSuccess(response);
          },
          function errorCallback(response) {
            onError(response);
          }
        );
      },
      postPurchase: function (productCode, onSuccess, onError) {

        networkService.postAuth(
          CONFIG.apiUrl + '/shop/buy',
          {code: productCode},
          function successCallback(response) {
            onSuccess(response);
          },
          function errorCallback(response) {
            onError(response);
          }
        );

      },
    };
  }
})();
