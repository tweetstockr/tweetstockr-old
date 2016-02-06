(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('walletController', walletController);

  function walletController ($scope, walletService) {

    walletService.getTransactions(
      function successCallback(response){
        $scope.transactionList = response;
      },
      function errorCallback(response){
        alert("error >> " + JSON.strigify(response));
      }
    );

    walletService.getStats(
      function successCallback(response){
        $scope.stats = response;
      },
      function errorCallback(response){
        alert("error >> " + JSON.strigify(response));
      }
    );

  }
})();
