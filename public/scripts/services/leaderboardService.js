module.exports = function (CONFIG, networkService) {
  return {
    getRanking: function (onSuccess, onError) {
      networkService.get(
        CONFIG.apiUrl + '/ranking',
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
