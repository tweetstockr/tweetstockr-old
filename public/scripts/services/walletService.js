module.exports = function ($http, $rootScope, networkService, CONFIG) {
  return {
    getTransactions: function (onSuccess, onError) {
      networkService.getAuth(
        CONFIG.apiUrl + '/statement',
        function successCallback(response) {
          onSuccess(response);
        },
        function errorCallback(response) {
          onError(response);
        }
      );
    },
    getStats: function (onSuccess, onError) {
      networkService.getAuth(
        CONFIG.apiUrl + '/stats',
        function successCallback(response) {
          onSuccess(response);
        },
        function errorCallback(response) {
          onError(response);
        }
      );
    }
  };
}
