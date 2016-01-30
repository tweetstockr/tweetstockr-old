(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .factory('userService', userService);

  function userService ($http, $rootScope) {

    return {
      getProfile: function (onSuccess, onError) {
        $http({
          method: 'GET',
          url: 'http://localhost:4000/profile',
          data: {},
          withCredentials: true
        })
        .then(function successCallback(response) {
          if (response.data.redirect_to) {
            window.location = 'http://localhost:4000' + response.data.redirect_to;
          }
          
          onSuccess(response);
        }, function errorCallback(response) {

          onSuccess(response);
        });
      }
    }
  }
})();
