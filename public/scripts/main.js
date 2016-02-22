(function() {
  'use strict';

  angular
    .module('tweetstockr', ['ngRoute', 'angular-chartist', 'ui-notification'])
    .constant('CONFIG', {
      apiUrl: 'http://localhost:4000'
    })
    .config(function ($routeProvider, $locationProvider, NotificationProvider) {

      $routeProvider

      .when('/market', {
        templateUrl: 'partials/market.html',
        controller: 'marketController'
      })

      .when('/market/:tab', {
        templateUrl: 'partials/market.html',
        controller: 'marketController'
      })

      .when('/market/:tab', {
        templateUrl: 'partials/market.html',
        controller: 'marketController'
      })

      .when('/wallet', {
        templateUrl: 'partials/wallet.html',
        controller: 'walletController'
      })

      // .when('/shop', {
      //   templateUrl: 'partials/shop.html',
      //   controller: 'shopController'
      // })

      .when('/ranking', {
        templateUrl: 'partials/ranking.html',
        controller: 'rankingController'
      })

      .when('/tournaments', {
        templateUrl: 'partials/tournaments.html',
        controller: 'tournamentsController'
      })

      .when('/profile', {
        templateUrl: 'partials/profile.html',
        controller: 'profileController'
      })

      .otherwise({
        redirectTo: '/market'
      });

      NotificationProvider.setOptions({
          delay: 1000
        , startTop: 20
        , startRight: 10
        , verticalSpacing: 20
        , horizontalSpacing: 20
        , positionX: 'right'
        , positionY: 'top'
      });
    });
})();
