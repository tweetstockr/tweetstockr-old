module.exports = function ($http, $rootScope, networkService, CONFIG) {
  return {
    getProfile: function (onSuccess, onError) {
      networkService.getAuth(
        CONFIG.apiUrl + '/profile',
        function successCallback(response) {
          onSuccess(response);
        },
        function errorCallback(response) {
          onError(response);
        }
      );
    },
    getBalance: function (onSuccess, onError) {
      networkService.getAuth(
        CONFIG.apiUrl + '/balance',
        function successCallback(response) {
          onSuccess(response);
        },
        function errorCallback(response) {
          onError(response);
        }
      );
    },
    resetAccount: function (onSuccess, onError) {
      networkService.postAuth(
        CONFIG.apiUrl + '/reset', {},
        function successCallback(response) {
          $rootScope.updateCurrentUser();
          onSuccess(response);
        },
        function errorCallback(response) {
          onError(response);
        }
      );
    }
  };
}
