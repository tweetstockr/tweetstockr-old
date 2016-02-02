(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('profileController', profileController);

  function profileController ($scope, userService, networkService, CONFIG) {

    userService.getProfile(
      function (data) {

        var user = data.user.twitter;
        $scope.user_photo = user.profile_image;
        $scope.user_name = user.username;
        $scope.balance = data.balance;

        //TODO: return user rank
        $scope.rank = '79';

      }, function (error) {
        console.log('User: ', error);
    });

    $scope.resetAccount = function () {

      networkService.postAuth(
        CONFIG.apiUrl + '/reset',
        {},
        function successCallback(response){
          if (response.message)
            alert(response.message);
        },
        function errorCallback(response){
          if (response.message)
            alert(response.message);
        });

    }
  }
})();
