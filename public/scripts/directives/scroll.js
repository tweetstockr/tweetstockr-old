(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .directive('scroll', function ($window) {
      return function(scope, element, attrs) {
        angular.element($window).bind('scroll', function() {
          if (this.pageYOffset >= 250) {
            scope.boolChangeClass = true;
          } else {
            scope.boolChangeClass = false;
          }

          scope.$apply();
        });
      };
    });
})();
