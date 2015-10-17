(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('forgotPasswordController', forgotPasswordController);

  function forgotPasswordController($resource, $scope, ForgotPassword, $window) {
    $scope.loading = false;

    $scope.send = function() {
      $scope.loading = true;
      $scope.error = '';

      ForgotPassword.save({
          email : $scope.email
        },
        function(result){
          $scope.loading = false;

          if (result.success === false) {
            $scope.error = result.error;
          } else {
            $window.location.href = 'http://' + $window.location.host;
          }
      });
    };
  }
})();
