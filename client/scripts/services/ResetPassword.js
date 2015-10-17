(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .factory('ResetPassword', ResetPassword);

  function ResetPassword($resource) {
    return $resource('/reset/:token');
  }
})();