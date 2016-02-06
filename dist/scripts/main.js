(function() {
  'use strict';

  angular
    .module('tweetstockr', ['ngRoute', 'angular-chartist'])
    .constant('CONFIG', {
      apiUrl: 'http://api.tweetstockr.com'
    })
    .config(["$routeProvider", "$locationProvider", function ($routeProvider, $locationProvider) {

      $routeProvider

      .when('/dashboard', {
        templateUrl: 'partials/dashboard.html',
        controller: 'dashboardController'
      })

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
        redirectTo: '/dashboard'
      });
    }]);
})();

(function() {
  'use strict';

  leaderboardService.$inject = ["CONFIG", "networkService"];
  angular
    .module('tweetstockr')
    .factory('leaderboardService', leaderboardService);

  function leaderboardService (CONFIG, networkService) {
    return {
      getRanking: function (onSuccess, onError) {

        networkService.get(
          CONFIG.apiUrl + '/ranking',
          function successCallback(response){
            onSuccess(response);
          },
          function errorCallback(response){
            onError(response);
          });

      }

    }
  }

})();

(function() {
  'use strict';

    networkService.$inject = ["$http"];
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

            if (response.data.redirect_to)
              window.location = response.data.redirect_to;

            if (response.data.success)
              onSuccessCallback(response.data);
            else
              onErrorCallback(response.data || {'message':'Sorry! An error ocurred.'});

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

            if (response.data.redirect_to)
              window.location = response.data.redirect_to;

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

            if (response.data.redirect_to)
              window.location = response.data.redirect_to;

            onSuccessCallback(response.data);

          }, function getError(response) {
            onErrorCallback({'message':'Error: Could not connect to the server.'});
            console.log('GET error: ' + response);
          });

        }


      }
    }

})();

(function() {
  'use strict';

  portfolioService.$inject = ["CONFIG", "networkService"];
  angular
    .module('tweetstockr')
    .factory('portfolioService', portfolioService);

  function portfolioService (CONFIG, networkService) {
    return {
      getPortfolio: function (onSuccess, onError) {

        networkService.getAuth(
          CONFIG.apiUrl + '/portfolio',
          function successCallback(response){
            onSuccess(response);
          },
          function errorCallback(response){
            onError(response);
          });

      }

    }
  }
})();

(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .factory('transactionsService', transactionsService);

  function transactionsService () {
    var transactionsList = [
      {
          "name": "#AllFandomsHereForSyria"
        , "amount": "18"
        , "date": "2015-12-215T16:21:37+00:00"
        , "points": 901
        , "sell": false
        , "buy": true
      },

      {
          "name": "#AllFandomsHereForSyria"
        , "amount": "01"
        , "date": "2015-12-31T20:07:44+00:00"
        , "points": 651
        , "sell": false
        , "buy": true
      },

      {
          "name": "VOTE LOVATICS"
        , "amount": "01"
        , "date": "2016-01-15T01:23:37+00:00"
        , "points": 93
        , "sell": false
        , "buy": true
      },

      {
          "name": "#50sfumaturedigrigio"
        , "amount": "02"
        , "date": "2016-01-12T17:17:12+00:00"
        , "points": 129
        , "sell": true
        , "buy": false
      },

      {
          "name": "#50sfumaturedigrigio"
        , "amount": "04"
        , "date": "2016-01-23T21:22:14+00:00"
        , "points": 1029
        , "sell": true
        , "buy": false
      },

      {
          "name": "#50sfumaturedigrigio"
        , "amount": "20"
        , "date": "2016-01-02T13:21:25+00:00"
        , "points": 1298
        , "sell": true
        , "buy": false
      },

      {
          "name": "#TopChef"
        , "amount": "11"
        , "date": "2016-01-22T06:07:37+00:00"
        , "points": 9182
        , "sell": false
        , "buy": true
      },

      {
          "name": "#TopChef"
        , "amount": "05"
        , "date": "2016-01-25T19:07:37+00:00"
        , "points": 12
        , "sell": false
        , "buy": true
      },

      {
          "name": "#TopChef"
        , "amount": "3"
        , "date": "2016-01-25T20:12:39+00:00"
        , "points": 323
        , "sell": false
        , "buy": true
      },

      {
          "name": "#RoyalRumble"
        , "amount": "11"
        , "date": "2016-01-25T04:06:17+00:00"
        , "points": 1009
        , "sell": false
        , "buy": true
      }
    ];

    return {
      getTransactions: function () {
        return transactionsList;
      }
    }
  }
})();
(function() {
  'use strict';

  userService.$inject = ["$http", "$rootScope", "networkService", "CONFIG"];
  angular
    .module('tweetstockr')
    .factory('userService', userService);

  function userService ($http, $rootScope, networkService, CONFIG) {
    return {
      getProfile: function (onSuccess, onError) {

        networkService.getAuth(
          CONFIG.apiUrl + '/profile',
          function successCallback(response){
            onSuccess(response);
          },
          function errorCallback(response){
            onError(response);
          });
      }
    }
  }
})();

(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .directive('navbar', function () {
      return {
        restrict: 'E',
        templateUrl: 'components/header.html',
        controller: 'headerController'
      };
    });
})();
(function() {
  'use strict';

  dashboardController.$inject = ["$scope"];
  angular
    .module('tweetstockr')
    .controller('dashboardController', dashboardController);

  function dashboardController ($scope) {
  }
})();
(function() {
  'use strict';

  headerController.$inject = ["$scope", "userService"];
  angular
    .module('tweetstockr')
    .controller('headerController', headerController);

  function headerController ($scope, userService) {
    userService.getProfile(
      function (data) {

        var user = data.user.twitter;

        $scope.twitter_user = user.username;
        $scope.username = user.displayName;
        $scope.balance = data.balance;

        // These are not being used yet...
        $scope.profile_image_thumb = user.profile_image_normal;
        $scope.twitter_url = 'https://twitter.com/' + user.username;

      }, function (error) {
        console.log('User: ', error);
    });
  }
})();

(function() {
  'use strict';

  marketController.$inject = ["$scope", "portfolioService", "networkService", "CONFIG"];
  angular
    .module('tweetstockr')
    .controller('marketController', marketController);

  function marketController ($scope, portfolioService, networkService, CONFIG) {
    var socket = io(CONFIG.apiUrl);

    socket.on('connect', function () {
      console.log('connected!');
      socket.emit('update-me');
    });

    socket.on('update', function (data) {
      $scope.stocks = data;

      for (var i = 0; i < $scope.stocks.length; i++) {
        var stock = $scope.stocks[i];
        var dataLenght = stock.history.length;

        if (stock.price > 0 && dataLenght > 1){
          if (stock.history[1].price > 0){
            var variationNumber = (( stock.price / stock.history[1].price ) - 1) * 100;
            stock.variation = Math.round(variationNumber).toFixed(0) + '%';
            stock.lastMove = (variationNumber < 0) ? 'danger' : 'success';
            stock.icon = (variationNumber < 0) ? 'fa-caret-down' : 'fa-caret-up';
          }
        }

        var chartData = {};
        chartData.labels = [];
        chartData.series = [[]];

        for (var j = dataLenght-1; j >= 0; j--){
          var time = new Date(stock.history[j].created);
          var label = time.getHours() + ':' + time.getMinutes();

          chartData.series[0].push(stock.history[j].price);
          chartData.labels.push(label);
        }

        stock.chartData = chartData;
      }

      console.log('Stocks: ', $scope.stocks);
      $scope.$apply();
    });

    $scope.tabs = [{
        title: 'Shares'
      , url: 'components/shares.html'
      , icon: 'icons/shares-icon.html'
    }, {
        title: 'Portfolio'
      , url: 'components/portfolio.html'
      , icon: 'icons/portfolio-icon.html'
    }];

    $scope.currentTab = 'components/shares.html';

    $scope.onClickTab = function (tab) {
      if(tab.url === 'components/shares.html') {
        $scope.currentTab = tab.url;

        $scope.isActiveTab = function (tabUrl) {
          return tabUrl === $scope.currentTab;
        };

      } else if(tab.url === 'components/portfolio.html') {
        $scope.currentTab = tab.url;

        $scope.isActiveTab = function (tabUrl) {
          return tabUrl === $scope.currentTab;
        };
      }
    };

    $scope.isActiveTab = function (tabUrl) {
      return tabUrl === $scope.currentTab;
    };

    $scope.sellShare = function(share){

      networkService.postAuth(
        CONFIG.apiUrl + '/trade/sell',
        { trade : share._id },
        function successCallback(response){
          alert(response.message); // You sell #blablabla
          $scope.getPortfolio();
        },
        function errorCallback(response){
          alert(response.message); // You do not have enough points
        });

    }

    $scope.buyShare = function(name, quantity) {

      networkService.postAuth(
        CONFIG.apiUrl + '/trade/buy',
        { stock: name, amount: quantity },
        function successCallback(response){

          var audio = document.getElementById('audio');
          audio.play();

          alert(response.message); // You have purchased #blablabla
          $scope.getPortfolio();

        },
        function errorCallback(response){
          alert(response.message); // You do not have enough points
        });

    }

    $scope.getPortfolio = function () {
      portfolioService.getPortfolio(
        function onSuccess(data) {
          $scope.portfolio = data;
        },
        function onError(data) {
          console.log('Portfolio Error: ' + data.message);
        }
      )
    }
  }
})();

(function() {
  'use strict';

  profileController.$inject = ["$scope", "userService", "networkService", "CONFIG"];
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

(function() {
  'use strict';

  rankingController.$inject = ["$scope", "leaderboardService"];
  angular
    .module('tweetstockr')
    .controller('rankingController', rankingController);

  function rankingController ($scope, leaderboardService) {

    leaderboardService.getRanking(
      function onSuccess(response){
        $scope.rankingList = response;
      },
      function onError(response){
        alert("error >> " + JSON.strigify(response));
      }
    );
  }
})();

(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('shopController', shopController);

  function shopController () {
    
  }
})();
(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('tournamentsController', tournamentsController);

  function tournamentsController () {
    
  }
})();
(function() {
  'use strict';

  walletController.$inject = ["$scope", "transactionsService"];
  angular
    .module('tweetstockr')
    .controller('walletController', walletController);

  function walletController ($scope, transactionsService) {
    $scope.transactionList = transactionsService.getTransactions();
  }
})();