(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('resetPasswordController', resetPasswordController);

  function resetPasswordController($scope, ResetPassword, $window) {
    $scope.send = function() {
      ResetPassword.save({
          password : $scope.password,
          token : $scope.token
        },
        function(result){
          if (result.success === false){
            $scope.error = result.error;
          } else {
            $window.location.href = 'http://' + $window.location.host + '/login';
          }
      });
    };
  }
})();
