(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('logoutController', logoutController);

  function logoutController(Auth, $window) {

    Auth.logout(function(err) {
      if(!err) {
        $window.location.href = 'http://' + $window.location.host + '/logout';
      }
    });

  }
})();
