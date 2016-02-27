module.exports = function ($scope, leaderboardService) {
  $scope.loading = false;

  leaderboardService.getRanking(
    function onSuccess(response) {
      $scope.rankingList = response;
      $scope.loading = true;
    },
    function onError(response) {
      console.log('error: ', JSON.stringify(response));
    }
  );
}
