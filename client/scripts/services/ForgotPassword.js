(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .factory('ForgotPassword', ForgotPassword);

  function ForgotPassword($resource) {
    return $resource('/auth/forgot');
  }
})();
