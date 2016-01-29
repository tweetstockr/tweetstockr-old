(function() {
  'use strict';

  angular
    .module('tweetstockr', ['ngRoute', 'angular-chartist'])
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

  angular
    .module('tweetstockr')
    .factory('leaderboardService', leaderboardService);

  function leaderboardService () {
    var leaderboard = [
      {
          "name": "Taylor Gordon"
        , "user_photo": "https://i.vimeocdn.com/portrait/3471430_300x300.jpg"
        , "user_points": 1635
      },

      {
          "name": "Sherri Ryan"
        , "user_photo": "https://secure.gravatar.com/avatar/3e1b4c0646f5679a31b4fcd992f64b10?d=https%3A%2F%2Fi.vimeocdn.com%2Fportrait%2Fdefault-green_300x300.png&s=300"
        , "user_points": 5368
      },

      {
          "name": "Owen Welch"
        , "user_photo": "https://i.vimeocdn.com/portrait/10991843_300x300.jpg"
        , "user_points": 7323
      },

      {
          "name": "Brad Roberts"
        , "user_photo": "https://i.vimeocdn.com/portrait/4900311_300x300.jpg"
        , "user_points": 1226
      },

      {
          "name": "Martin Schnitzer"
        , "user_photo": "https://s3.amazonaws.com/ideo-org-images-production/fellow_avatars/127/original/Martin-Schnitzer-Portrait.jpg"
        , "user_points": 3847
        , "me": true
      },

      {
          "name": "Minnie Bredouw"
        , "user_photo": "https://s3.amazonaws.com/ideo-org-images-production/fellow_avatars/123/original/Minnie-Bredouw-Portrait.jpg"
        , "user_points": 8495
      },

      {
          "name": "Allie Avital"
        , "user_photo": "https://i.vimeocdn.com/portrait/10428575_300x300.jpg"
        , "user_points": 7374
      },

      {
          "name": "Brad Roberts"
        , "user_photo": "https://i.vimeocdn.com/portrait/4900311_300x300.jpg"
        , "user_points": 4902
      },

      {
          "name": "Nikolas Woischnik"
        , "user_photo": "http://www.heisenbergmedia.com/wp-content/uploads/2015/06/Nikolas-Woischnik-Image-by-Dan-Taylor-dan@heisenbergmedia.com-1-1.jpg?15ba49"
        , "user_points": 2349
      }
    ];

    return {
      getUser: function () {
        return leaderboard;
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

  angular
    .module('tweetstockr')
    .controller('dashboardController', dashboardController);

  function dashboardController () {
    
  }
})();
(function() {
  'use strict';

  marketController.$inject = ["$scope", "$route", "$routeParams"];
  angular
    .module('tweetstockr')
    .controller('marketController', marketController);

  function marketController ($scope, $route, $routeParams) {
    var socket = io('http://localhost:4000');

    socket.on('connect', function () {
      console.log('connected!');
      socket.emit('update-me');
    });

    socket.on('update', function (trends) {
      $scope.trendsList = trends;
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
  }
})();
(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('profileController', profileController);

  function profileController () {
    
  }
})();
(function() {
  'use strict';

  rankingController.$inject = ["$scope", "leaderboardService"];
  angular
    .module('tweetstockr')
    .controller('rankingController', rankingController);

  function rankingController ($scope, leaderboardService) {
    $scope.rankingList = leaderboardService.getUser();
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