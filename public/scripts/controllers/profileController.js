module.exports = function ($rootScope, $scope, userService, Notification) {
  $rootScope.updateCurrentUser();

  $scope.resetAccount = function () {
    userService.resetAccount(
      function successCallback(response) {
        if (response.message) {
          Notification.success(response.message);
        }
      },
      function errorCallback(response) {
        if (response.message) {
          Notification.error(response.message);
        }
      }
    );
  };
}
