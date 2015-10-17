(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .directive('uniqueUsername', uniqueUsername);

  function uniqueUsername($http) {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, element, attrs, ngModel) {
        function validate(value) {
          // Do not send request if less than 3 characters
          if(!value || value.length <= 3) {
            ngModel.$setValidity('unique', true);
            return;
          }
          
          $http.get('/auth/check_username/' + value).success(function(user) {
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