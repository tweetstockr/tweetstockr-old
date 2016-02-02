(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .factory('networkService', networkService);

  function networkService ($http) {
    return {
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

            if (response.data.redirect_to)
              window.location = response.data.redirect_to;

            if (response.data.success)
              onSuccessCallback(response.data);
            else
              onErrorCallback(response.data || {'message':'Sorry! An error ocurred.'});

          }, function postError(response) {
            console.log('Error: ' + response);
          });
        }

      }
    }

})();
