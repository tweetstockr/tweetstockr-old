(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('shopController', shopController);

  function shopController ($scope, shopService, Notification) {

    $scope.loading = false;

    shopService.getProducts(
      function onSuccess(response) {
        $scope.productsList = response;
        $scope.loading = true;
      },
      function onError(response) {
        $scope.productsList = response;
        console.log('error: ', JSON.stringify(response));
      }
    );

    $scope.buyProduct = function(productCode){

      shopService.postPurchase(productCode,
        function successCallback(response) {
          Notification.success(response);
        },
        function errorCallback(response) {
          Notification.error(response.message);
        }
      );

    };

  }
})();
