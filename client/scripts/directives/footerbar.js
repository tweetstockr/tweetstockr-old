(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .directive('footerbar', function () {
      return {
        restrict: 'E',
        templateUrl: 'shared/footerbar',
        replace: true
      };
    });
})();
