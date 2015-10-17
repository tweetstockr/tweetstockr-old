(function() {
  'use strict';

  // how it works here:
  // http://www.sitepoint.com/creating-crud-app-minutes-angulars-resource/

  angular
    .module('tweetstockr')
    .factory('Shares', Shares);

  function Shares($resource) {
    return $resource('api/shares/:shareId', {
      shareId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();
