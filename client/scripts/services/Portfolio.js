(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .factory('Portfolio', Portfolio);

  function Portfolio($resource) {
    return $resource('api/portfolio/');
  }
})();
