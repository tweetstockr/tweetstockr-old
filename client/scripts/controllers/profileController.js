(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('profileController', profileController);

  function profileController($scope , Auth, $location, ResetAccount, $window) {
    $scope.logout = function() {
      Auth.logout(function(err) {
        if(!err) {
          $location.path('/login');
        }
      });
    };

    $scope.resetAccount = function(){
      ResetAccount.save(
        function(result) {
          $window.location.href = 'http://' + $window.location.host;
      });
    };
  }
})();
