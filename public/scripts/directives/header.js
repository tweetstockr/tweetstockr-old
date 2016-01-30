(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .directive('navbar', function () {
      return {
        restrict: 'E',
        templateUrl: 'components/header.html',
        controller: 'headerController'
      };
    });
})();