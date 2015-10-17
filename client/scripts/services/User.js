(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .factory('User', User);

  function User($resource) {
    return $resource('/auth/user/:id/', {},
    {
      'update': {
        method:'PUT'
      }
    });
  }
})();
