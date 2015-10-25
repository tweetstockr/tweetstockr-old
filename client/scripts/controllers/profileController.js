(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('profileController', profileController);

  function profileController(Auth, $location, ResetAccount, $window, $rootScope) {
    var vm = this;

    // Setting name/username to name/username field on view.
    vm.name = $rootScope.currentUser.name
    vm.username = $rootScope.currentUser.username

    vm.logout = function() {
      Auth.logout(function(err) {
        if(!err) {
          $location.path('/');
        }
      });
    };

    vm.resetAccount = function() {
      ResetAccount.save(
        function(result) {
          $window.location.href = 'http://' + $window.location.host;
        });
    };

    vm.openModal = function () {
      vm.confirmModal = true;
    }

    vm.closeModal = function () {
      vm.confirmModal = false;
    }
  }
})();
