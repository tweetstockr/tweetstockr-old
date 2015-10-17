(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .directive('uniqueEmail', uniqueEmail);

  function uniqueEmail($http) {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, element, attrs, ngModel) {
        function validate(value) {
          // Do not send request if less than 5 characters
          if(!value || value.length <= 5) {
            ngModel.$setValidity('unique', true);
            return;
          }

          $http.get('/auth/check_email/' + value).success(function(user) {
            if(!user.exists) {
              ngModel.$setValidity('unique', true);
            } else {
              ngModel.$setValidity('unique', false);
            }
          });
        }

        scope.$watch( function() {
          return ngModel.$viewValue;
        }, validate);
      }
    };
  }
})();
