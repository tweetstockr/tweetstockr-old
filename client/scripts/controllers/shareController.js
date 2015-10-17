(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('shareController', shareController);

  function shareController($scope, $resource) {
    var ShareResource = $resource('/api/shares');

    ShareResource.query(function(results){
      $scope.shares = results;
    });

    $scope.createShare = function(){
      var share = new ShareResource();
      share.stock = $scope.shareStock;

      // POST
      share.$save(function (result){
        $scope.shares.push(result);
        $scope.shareStock = '';
      });
    };
  }
})();