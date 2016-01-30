(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('walletController', walletController);

  function walletController ($scope, transactionsService) {
    $scope.transactionList = transactionsService.getTransactions();
  }
})();