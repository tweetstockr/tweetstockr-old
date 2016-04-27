(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('shopController', shopController);

  function shopController ($scope, shopService, Notification) {

    $scope.loading = true;

    shopService.getProducts(
      function onSuccess(response) {
        $scope.productsList = response;
        $scope.loading = false;
      },
      function onError(response) {
        $scope.loading = false;
        $scope.productsList = response;
        console.log('error: ', JSON.stringify(response));
      }
    );

    $scope.buyProduct = function(productCode){

      $scope.loading = true;

      shopService.postPurchase(productCode,
        function successCallback(response) {
          $scope.loading = false;
          Notification.success(response);
        },
        function errorCallback(response) {
          $scope.loading = false;
          Notification.error(response.message);
        }
      );

    };

  }
})();
