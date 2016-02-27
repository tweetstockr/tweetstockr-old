module.exports = function ($scope, tournamentService) {
  $scope.loading = false;

  tournamentService.getActiveTournaments(
    function onSuccess(response) {
      $scope.tournamentsList = response;
      $scope.loading = true;
    },
    function onError(response) {
      console.log('error: ', JSON.stringify(response));
    }
  );
}
