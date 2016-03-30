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
          function successCallback(response) {
            onSuccess(response);
          },
          function errorCallback(response) {
            onError(response);
          }
        );
      },
      getBalance: function (onSuccess, onError) {
        networkService.getAuth(
          CONFIG.apiUrl + '/balance',
          function successCallback(response) {
            onSuccess(response);
          },
          function errorCallback(response) {
            onError(response);
          }
        );
      },
      resetAccount: function (onSuccess, onError) {
        networkService.postAuth(
          CONFIG.apiUrl + '/reset', {},
          function successCallback(response) {
            $rootScope.updateCurrentUser();
            onSuccess(response);
          },
          function errorCallback(response) {
            onError(response);
          }
        );
      },

      logout: function(onSuccess, onError) {
        networkService.postAuth(
          CONFIG.apiUrl + '/logout', {},
          function successCallback(response) {
            onSuccess(response);
          },
          function errorCallback(response) {
            onError(response);
          }
        );
      },

      joysticketLogin : function(onSuccess, onError){
        networkService.getAuth(
          CONFIG.apiUrl + '/joylogin',
          function successCallback(response) {
            onSuccess(response);
          },
          function errorCallback(response) {
            onError(response);
          }
        );
      },

      joysticketLogout : function(onSuccess, onError){
        networkService.getAuth(
          CONFIG.apiUrl + '/joylogout',
          function successCallback(response) {
            window.location.reload();
          },
          function errorCallback(response) {
            onError(response);
          }
        );
      }

    };
  }
})();
