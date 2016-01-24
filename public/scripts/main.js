(function() {
  'use strict';

  angular
    .module('tweetstockr', ['ngRoute'])
    .config(function ($routeProvider, $locationProvider) {
      $routeProvider

      .when('/dashboard', {
        templateUrl: 'partials/dashboard.html',
        controller: 'dashboardController'
      })

      .when('/wallet', {
        templateUrl: 'partials/wallet.html',
        controller: 'walletController'
      })

      .when('/shop', {
        templateUrl: 'partials/shop.html',
        controller: 'shopController'
      })

      .when('/ranking', {
        templateUrl: 'partials/ranking.html',
        controller: 'rankingController'
      })

      .otherwise({
        redirectTo: '/dashboard'
      });
    });
})();