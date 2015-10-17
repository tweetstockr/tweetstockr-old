(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('signupController', signupController);

  function signupController($scope, Auth, $location) {
    $scope.register = function(form) {
      Auth.createUser({
          username : $scope.username,
          email    : $scope.email,
          password : $scope.password
        },
        function(err) {
          $scope.errors = {};

          if (!err) {
            $location.path('/');
          } else {
            angular.forEach(err.errors, function(error, field) {
              form[field].$setValidity('mongoose', false);
              $scope.errors[field] = error.type;
            });
          }
        }
      );
    };
  }
})();
