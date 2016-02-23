(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('tournamentsController', tournamentsController);

  function tournamentsController ($scope, tournamentService) {
    $scope.loading = false;

    tournamentService.getActiveTournaments(
      function onSuccess(response) {
        console.log('tt', response);
        $scope.tournamentsList = response;
        $scope.loading = true;
      },
      function onError(response) {
        console.log('error: ', JSON.stringify(response));
      }
    );
  }
})();
