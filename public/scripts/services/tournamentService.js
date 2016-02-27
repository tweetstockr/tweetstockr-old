module.exports = function (CONFIG, networkService) {
  return {
    getActiveTournaments: function (onSuccess, onError) {
      networkService.getAuth(
        CONFIG.apiUrl + '/tournaments',
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
