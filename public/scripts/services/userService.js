(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .factory('userService', userService);

  function userService ($http, $rootScope, networkService, CONFIG) {
    return {
      getProfile: function (onSuccess, onError) {

        networkService.getAuth(
          CONFIG.apiUrl + '/profile',
          function successCallback(response){
            onSuccess(response);
          },
          function errorCallback(response){
            onError(response);
          });
      }
    }
  }
})();
