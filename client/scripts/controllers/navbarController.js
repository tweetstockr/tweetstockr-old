(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('navbarController', navbarController);

  function navbarController($scope, $location) {
    $scope.registrationNavbar = function (path) {
      if ($location.path() === path) {
        return 'navbar-registration';
      } else if($location.path().substring(0, 10) === path.substring(0,10) || $location.path().substring(0, 6) === path.substring(0,6)) {
        return 'navbar-registration';
      } else {
        return false;
      }
    };
  }
})();
