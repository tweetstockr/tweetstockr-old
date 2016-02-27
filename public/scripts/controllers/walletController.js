module.exports = function ($scope, walletService) {
  $scope.loading = false;

  walletService.getTransactions(
    function successCallback(response) {
      $scope.transactionList = response;
      $scope.loading = true;
    },
    function errorCallback(response) {
      console.log('error: ', JSON.stringify(response));
    }
  );

  walletService.getStats(
    function successCallback(response) {
      $scope.stats = response;
    },
    function errorCallback(response) {
      console.log('error: ', JSON.stringify(response));
    }
  );
}
