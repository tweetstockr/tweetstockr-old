(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('indexController', indexController);

  function indexController($scope, $location) {
    $scope.registrationContent = function (path) {
      if ($location.path() === path) {
        return 'content-registration';
      } else if($location.path().substring(0, 10) === path.substring(0,10) || $location.path().substring(0, 6) === path.substring(0,6)) {
        return 'content-registration';
      } else {
        return false;
      }
    };
  }
})();