(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .factory('networkService', networkService);

  function networkService ($http) {
    return {
      // Post data with authentication
      postAuth: function (postUrl, postData, onSuccessCallback, onErrorCallback) {
        $http({
          method: 'POST',
          url: postUrl,
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          transformRequest: function(obj) {
            var str = [];
            for(var p in obj)
            str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
            return str.join('&');
          },
          data: postData,
          withCredentials: true
        }).then(function completeCallback(response) {
            if (response.data.redirect_to) {
              window.location = response.data.redirect_to;
            }

            if (response.data.success) {
              onSuccessCallback(response.data);
            } else {
              onErrorCallback(response.data || {'message':'Sorry! An error ocurred.'});
            }
          }, function postError(response) {
            onErrorCallback({'message':'Error: Could not connect to the server.'});
            console.log('Authenticated POST error: ' + response);
          });
        },

        // Get data with authentication
        getAuth: function (getUrl, onSuccessCallback, onErrorCallback) {
          $http({
            method: 'GET',
            url: getUrl,
            withCredentials: true
          })
          .then(function completeCallback(response) {
            if (response.data.redirect_to) {
              window.location = response.data.redirect_to;
            }

            onSuccessCallback(response.data);
          }, function getError(response) {
            onErrorCallback({'message':'Error: Could not connect to the server.'});
            console.log('Authenticated GET error: ' + response);
          });
        },

        // Get data without authentication
        get: function (getUrl, onSuccessCallback, onErrorCallback) {
          $http({
            method: 'GET',
            url: getUrl,
          })
          .then(function completeCallback(response) {
            if (response.data.redirect_to) {
              window.location = response.data.redirect_to;
            }

            onSuccessCallback(response.data);
          }, function getError(response) {
            onErrorCallback({'message':'Error: Could not connect to the server.'});
            console.log('GET error: ' + response);
          });
        },

      };
    }
})();
