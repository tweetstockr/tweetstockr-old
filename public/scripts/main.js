(function() {
  'use strict';

  // vendors
  var angular = require('angular')
    , routes = require('angular-route')
    , chartist = require('angular-chartist.js')
    , notification = require('angular-ui-notification');

  // services
  var leaderboardService = require('./services/leaderboardService')
    , marketService = require('./services/marketService')
    , networkService = require('./services/networkService')
    , portfolioService = require('./services/portfolioService')
    , tournamentService = require('./services/tournamentService')
    , userService = require('./services/userService')
    , walletService = require('./services/walletService');

  // controllers
  var headerController = require('./controllers/headerController')
    , marketController = require('./controllers/marketController')
    , profileController = require('./controllers/profileController')
    , rankingController = require('./controllers/rankingController')
    , shopController = require('./controllers/shopController')
    , tournamentsController = require('./controllers/tournamentsController')
    , walletController = require('./controllers/walletController');

  var countdown = require('./directives/countdown')
    , header = require('./directives/header');

  angular
    .module('tweetstockr', ['routes', 'chartist', 'notification'])
    .constant('CONFIG', {
      apiUrl: 'http://api.tweetstockr.com'
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

      .when('/shop', {
        templateUrl: 'partials/shop.html',
        controller: 'shopController'
      })

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
    })
    .controller('headerController', headerController);
})();
