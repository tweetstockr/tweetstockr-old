(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .factory('Session', Session);

  function Session($resource) {
    return $resource('/auth/session/');
  }
})();
