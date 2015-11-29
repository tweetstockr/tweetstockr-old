(function() {
  'use strict';

  angular
    .module('tweetstockr', [
      'ngResource',
      'ngRoute',
      'ngCookies',
      'angular-chartist',
      'ui-notification'
    ])
    .config(function($routeProvider, $locationProvider, NotificationProvider) {
      $routeProvider
      .when('/home', {
        templateUrl: 'partials/home',
        controller: 'homeController'
      })

      .when('/profile', {
        templateUrl: 'partials/profile',
        controller: 'profileController',
        controllerAs: 'profile'
      })

      .when('/logout', {
        templateUrl: 'partials/logout',
        controller: 'logoutController',
        controllerAs: 'logout'
      })

      .when('/ranking', {
        templateUrl: 'partials/ranking',
        controller: 'rankingController',
        controllerAs: 'ranking'
      })

      .when('/about', {
        templateUrl: 'partials/about',
        controller: 'aboutController',
        controllerAs: 'about'
      })

      .otherwise({
        redirectTo: '/home'
      });

      $locationProvider.html5Mode(true);

      NotificationProvider.setOptions({
        delay: 5000,
        startTop: 20,
        startRight: 20,
        verticalSpacing: 20,
        horizontalSpacing: 20,
        positionX: 'right',
        positionY: 'top'
      });
    })

    .run(function ($rootScope, $location, Auth) {
      //watching the value of the currentUser variable.
      $rootScope.$watch('currentUser', function(currentUser) {
        Auth.currentUser();
      });
    });
})();

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var ordinal = require('ordinal-number-suffix');

angular
  .module('tweetstockr')

  // Take a number and returns its ordinal value
  // i.e. 1 -> 1st, 2 -> 2nd, etc.
  .filter('ordinal', function() {
    return function(input) {
      var num = parseInt(input, 10);
      return isNaN(num) ? input : ordinal(num);
    };
  });

},{"ordinal-number-suffix":2}],2:[function(require,module,exports){

/**
 * Get the ordinal number with suffix from `n`
 *
 * @api public
 * @param {Number} n
 * @return {String}
 */
exports = module.exports = function (n) {
  return n + exports.suffix(+n);
};

/**
 * Get the suffix for the given `n`
 *
 * @api private
 * @param {Number} n
 * @return {String}
 */
exports.suffix = function (n) {
  return Math.floor(n / 10) === 1
      ? 'th'
      : (n % 10 === 1
        ? 'st'
        : (n % 10 === 2
          ? 'nd'
          : (n % 10 === 3
            ? 'rd'
            : 'th')));
};

},{}]},{},[1]);

(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('aboutController', aboutController);

  function aboutController() {



  }
})();

(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('homeController', homeController);

  function homeController($scope, Socket, Portfolio, Shares, $interval, $timeout, $rootScope, Notification, $window) {
    $scope.points = false;
    $scope.variation = false;

    console.log($rootScope.currentUser);

    $scope.getPortfolio = function() {
      if ($scope.currentUser) {
        Portfolio.query(function(shares) {
          $scope.portfolio = shares;
        });
      }
    };

    $scope.buyShare = function(stock) {
      if($rootScope.currentUser === null) {
        $window.location.href = '/auth/twitter';
      } else {
        var share = new Shares({
          stock: stock.name,
          amount: stock.amount
        });

        share.$save(function(res) {
          if (res.success === false) {
            Notification.error(res.message);
          } else {
            Notification.success('You bought ' + res.stock + '!');
            $rootScope.currentUser = res.owner;
            $scope.getPortfolio();
          }
        });
      }
    };

    $scope.sellShare = function(shareId) {
      var share = Shares.get({
        shareId : shareId
      }, function() {
        share.$delete(function(res) {
          Notification.success('You sold ' + res.stock + '!');
          $rootScope.currentUser = res.owner;
          $scope.getPortfolio();
        });
      });
    };

    $scope.getStocks = function() {
      Socket.emit('update-me');
      $scope.getPortfolio();
    };

    $scope.chartOptions = {
      seriesBarDistance: 15,
      showArea: true
    };

    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    }

    // Update data

    Socket.on('tweet', function(data){

      $scope.tweet = data;

    });

    Socket.on('currentCount', function(data){

      $scope.currentCount = data;

    });

    Socket.on('update', function(data) {

      $scope.stocks = data;

      for (var i = 0; i < $scope.stocks.length; i++) {
        var stock = $scope.stocks[i];
        var dataLenght = stock.history.length;

        // Get variation -------------------------------------------------------
        if (stock.count > 0 && dataLenght > 1){
          if (stock.history[1].count > 0){
            // ( (currentPrice/lastPrice)-1 ) * 100
            var variationNumber =
                          (( stock.count / stock.history[1].count ) - 1) * 100;
            stock.variation = Math.round(variationNumber).toFixed(0) + '%';
            stock.lastMove = (variationNumber < 0) ? 'danger' : 'success';
            stock.icon = (variationNumber < 0) ? 'fa-caret-down' : 'fa-caret-up';
          }
        }
        // ---------------------------------------------------------------------

        // Prepare chart data --------------------------------------------------
        var chartData = {};

        chartData.labels = [];
        chartData.series = [[]];

        for (var i2 = dataLenght-1; i2 >= 0; i2--){
          var d = new Date(stock.history[i2].created);
          var label = d.getHours() + ':' + d.getMinutes();

          chartData.series[0].push(stock.history[i2].count);
          chartData.labels.push(label);
        }

        stock.chartData = chartData;
        // ---------------------------------------------------------------------
      }

      $scope.responseReceived = true;
      $scope.getPortfolio();
    });

    Socket.on('update-date', function(data) {
      $scope.stocksUpdatedAt = new Date(data);
    });
  }
})();

(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('logoutController', logoutController);

  function logoutController(Auth, $window) {

    Auth.logout(function(err) {
      if(!err) {
        $window.location.href = 'http://' + $window.location.host + '/logout';
      }
    });

  }
})();

(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('profileController', profileController);

  function profileController($location, ResetAccount, $window, $rootScope) {
    var vm = this;

    // Setting name/username to name/username field on view.
    vm.name = $rootScope.currentUser.name
    vm.username = $rootScope.currentUser.username

    vm.resetAccount = function() {
      ResetAccount.save(
        function(result) {
          $window.location.href = 'http://' + $window.location.host;
        });
    };

    vm.openModal = function () {
      vm.confirmModal = true;
    }

    vm.closeModal = function () {
      vm.confirmModal = false;
    }
  }
})();

(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('rankingController', rankingController);

  function rankingController(Ranking) {
    var vm = this;

    vm.find = function() {
      Ranking.query(function(ranking) {
        vm.users = ranking;
      });
    };

    vm.find();
  }
})();

(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .directive('footerbar', function () {
      return {
        restrict: 'E',
        templateUrl: 'shared/footerbar'
      };
    });
})();

(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .directive('navbar', function () {
      return {
        restrict: 'E',
        templateUrl: 'shared/navbar'
      };
    });
})();
(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .factory('Auth', Auth);

  function Auth($rootScope, $cookies, $resource) {
    $rootScope.currentUser = angular.fromJson($cookies.get('user')) || null;
    $cookies.remove('user');

    return {
      currentUser: function() {},
      logout: function(cb){
        $rootScope.currentUser = null;
        $cookies.remove('user');
        cb();
      }
    };
  }
})();

(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .factory('Portfolio', Portfolio);

  function Portfolio($resource) {
    return $resource('api/portfolio/');
  }
})();

(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .factory('Ranking', Ranking);

  function Ranking($resource) {
    return $resource('api/ranking/');
  }
})();

(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .factory('ResetAccount', ResetAccount);

  function ResetAccount($resource) {
    return $resource('/auth/reset/:userId');
  }
})();

(function() {
  'use strict';

  // how it works here:
  // http://www.sitepoint.com/creating-crud-app-minutes-angulars-resource/

  angular
    .module('tweetstockr')
    .factory('Shares', Shares);

  function Shares($resource) {
    return $resource('api/shares/:shareId', {
      shareId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();

(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .factory('Socket', Socket);

  function Socket($rootScope) {
    var socket = io.connect();

    return {
      on: function (eventName, callback) {
        function wrapper() {
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        }

        socket.on(eventName, wrapper);

        return function () {
          socket.removeListener(eventName, wrapper);
        };
      },
      emit: function (eventName, data, callback) {
        socket.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if(callback) {
              callback.apply(socket, args);
            }
          });
        });
      }
    };
  }
})();

(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .factory('User', User);

  function User($resource) {
    return $resource('/auth/user/:id/', {},
    {
      'update': {
        method:'PUT'
      }
    });
  }
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsIm9yZGluYWwuanMiLCJhYm91dENvbnRyb2xsZXIuanMiLCJob21lQ29udHJvbGxlci5qcyIsImxvZ291dENvbnRyb2xsZXIuanMiLCJwcm9maWxlQ29udHJvbGxlci5qcyIsInJhbmtpbmdDb250cm9sbGVyLmpzIiwiZm9vdGVyYmFyLmpzIiwibmF2YmFyLmpzIiwiQXV0aC5qcyIsIlBvcnRmb2xpby5qcyIsIlJhbmtpbmcuanMiLCJSZXNldEFjY291bnQuanMiLCJTaGFyZXMuanMiLCJTb2NrZXQuanMiLCJVc2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgYW5ndWxhclxuICAgIC5tb2R1bGUoJ3R3ZWV0c3RvY2tyJywgW1xuICAgICAgJ25nUmVzb3VyY2UnLFxuICAgICAgJ25nUm91dGUnLFxuICAgICAgJ25nQ29va2llcycsXG4gICAgICAnYW5ndWxhci1jaGFydGlzdCcsXG4gICAgICAndWktbm90aWZpY2F0aW9uJ1xuICAgIF0pXG4gICAgLmNvbmZpZyhmdW5jdGlvbigkcm91dGVQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIsIE5vdGlmaWNhdGlvblByb3ZpZGVyKSB7XG4gICAgICAkcm91dGVQcm92aWRlclxuICAgICAgLndoZW4oJy9ob21lJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ3BhcnRpYWxzL2hvbWUnLFxuICAgICAgICBjb250cm9sbGVyOiAnaG9tZUNvbnRyb2xsZXInXG4gICAgICB9KVxuXG4gICAgICAud2hlbignL3Byb2ZpbGUnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAncGFydGlhbHMvcHJvZmlsZScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdwcm9maWxlQ29udHJvbGxlcicsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJ3Byb2ZpbGUnXG4gICAgICB9KVxuXG4gICAgICAud2hlbignL2xvZ291dCcsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdwYXJ0aWFscy9sb2dvdXQnLFxuICAgICAgICBjb250cm9sbGVyOiAnbG9nb3V0Q29udHJvbGxlcicsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJ2xvZ291dCdcbiAgICAgIH0pXG5cbiAgICAgIC53aGVuKCcvcmFua2luZycsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdwYXJ0aWFscy9yYW5raW5nJyxcbiAgICAgICAgY29udHJvbGxlcjogJ3JhbmtpbmdDb250cm9sbGVyJyxcbiAgICAgICAgY29udHJvbGxlckFzOiAncmFua2luZydcbiAgICAgIH0pXG5cbiAgICAgIC53aGVuKCcvYWJvdXQnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAncGFydGlhbHMvYWJvdXQnLFxuICAgICAgICBjb250cm9sbGVyOiAnYWJvdXRDb250cm9sbGVyJyxcbiAgICAgICAgY29udHJvbGxlckFzOiAnYWJvdXQnXG4gICAgICB9KVxuXG4gICAgICAub3RoZXJ3aXNlKHtcbiAgICAgICAgcmVkaXJlY3RUbzogJy9ob21lJ1xuICAgICAgfSk7XG5cbiAgICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTtcblxuICAgICAgTm90aWZpY2F0aW9uUHJvdmlkZXIuc2V0T3B0aW9ucyh7XG4gICAgICAgIGRlbGF5OiA1MDAwLFxuICAgICAgICBzdGFydFRvcDogMjAsXG4gICAgICAgIHN0YXJ0UmlnaHQ6IDIwLFxuICAgICAgICB2ZXJ0aWNhbFNwYWNpbmc6IDIwLFxuICAgICAgICBob3Jpem9udGFsU3BhY2luZzogMjAsXG4gICAgICAgIHBvc2l0aW9uWDogJ3JpZ2h0JyxcbiAgICAgICAgcG9zaXRpb25ZOiAndG9wJ1xuICAgICAgfSk7XG4gICAgfSlcblxuICAgIC5ydW4oZnVuY3Rpb24gKCRyb290U2NvcGUsICRsb2NhdGlvbiwgQXV0aCkge1xuICAgICAgLy93YXRjaGluZyB0aGUgdmFsdWUgb2YgdGhlIGN1cnJlbnRVc2VyIHZhcmlhYmxlLlxuICAgICAgJHJvb3RTY29wZS4kd2F0Y2goJ2N1cnJlbnRVc2VyJywgZnVuY3Rpb24oY3VycmVudFVzZXIpIHtcbiAgICAgICAgQXV0aC5jdXJyZW50VXNlcigpO1xuICAgICAgfSk7XG4gICAgfSk7XG59KSgpO1xuIiwiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkoezE6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgb3JkaW5hbCA9IHJlcXVpcmUoJ29yZGluYWwtbnVtYmVyLXN1ZmZpeCcpO1xuXG5hbmd1bGFyXG4gIC5tb2R1bGUoJ3R3ZWV0c3RvY2tyJylcblxuICAvLyBUYWtlIGEgbnVtYmVyIGFuZCByZXR1cm5zIGl0cyBvcmRpbmFsIHZhbHVlXG4gIC8vIGkuZS4gMSAtPiAxc3QsIDIgLT4gMm5kLCBldGMuXG4gIC5maWx0ZXIoJ29yZGluYWwnLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgIHZhciBudW0gPSBwYXJzZUludChpbnB1dCwgMTApO1xuICAgICAgcmV0dXJuIGlzTmFOKG51bSkgPyBpbnB1dCA6IG9yZGluYWwobnVtKTtcbiAgICB9O1xuICB9KTtcblxufSx7XCJvcmRpbmFsLW51bWJlci1zdWZmaXhcIjoyfV0sMjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5cbi8qKlxuICogR2V0IHRoZSBvcmRpbmFsIG51bWJlciB3aXRoIHN1ZmZpeCBmcm9tIGBuYFxuICpcbiAqIEBhcGkgcHVibGljXG4gKiBAcGFyYW0ge051bWJlcn0gblxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobikge1xuICByZXR1cm4gbiArIGV4cG9ydHMuc3VmZml4KCtuKTtcbn07XG5cbi8qKlxuICogR2V0IHRoZSBzdWZmaXggZm9yIHRoZSBnaXZlbiBgbmBcbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBuXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMuc3VmZml4ID0gZnVuY3Rpb24gKG4pIHtcbiAgcmV0dXJuIE1hdGguZmxvb3IobiAvIDEwKSA9PT0gMVxuICAgICAgPyAndGgnXG4gICAgICA6IChuICUgMTAgPT09IDFcbiAgICAgICAgPyAnc3QnXG4gICAgICAgIDogKG4gJSAxMCA9PT0gMlxuICAgICAgICAgID8gJ25kJ1xuICAgICAgICAgIDogKG4gJSAxMCA9PT0gM1xuICAgICAgICAgICAgPyAncmQnXG4gICAgICAgICAgICA6ICd0aCcpKSk7XG59O1xuXG59LHt9XX0se30sWzFdKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGFuZ3VsYXJcbiAgICAubW9kdWxlKCd0d2VldHN0b2NrcicpXG4gICAgLmNvbnRyb2xsZXIoJ2Fib3V0Q29udHJvbGxlcicsIGFib3V0Q29udHJvbGxlcik7XG5cbiAgZnVuY3Rpb24gYWJvdXRDb250cm9sbGVyKCkge1xuXG5cblxuICB9XG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgYW5ndWxhclxuICAgIC5tb2R1bGUoJ3R3ZWV0c3RvY2tyJylcbiAgICAuY29udHJvbGxlcignaG9tZUNvbnRyb2xsZXInLCBob21lQ29udHJvbGxlcik7XG5cbiAgZnVuY3Rpb24gaG9tZUNvbnRyb2xsZXIoJHNjb3BlLCBTb2NrZXQsIFBvcnRmb2xpbywgU2hhcmVzLCAkaW50ZXJ2YWwsICR0aW1lb3V0LCAkcm9vdFNjb3BlLCBOb3RpZmljYXRpb24sICR3aW5kb3cpIHtcbiAgICAkc2NvcGUucG9pbnRzID0gZmFsc2U7XG4gICAgJHNjb3BlLnZhcmlhdGlvbiA9IGZhbHNlO1xuXG4gICAgY29uc29sZS5sb2coJHJvb3RTY29wZS5jdXJyZW50VXNlcik7XG5cbiAgICAkc2NvcGUuZ2V0UG9ydGZvbGlvID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoJHNjb3BlLmN1cnJlbnRVc2VyKSB7XG4gICAgICAgIFBvcnRmb2xpby5xdWVyeShmdW5jdGlvbihzaGFyZXMpIHtcbiAgICAgICAgICAkc2NvcGUucG9ydGZvbGlvID0gc2hhcmVzO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgJHNjb3BlLmJ1eVNoYXJlID0gZnVuY3Rpb24oc3RvY2spIHtcbiAgICAgIGlmKCRyb290U2NvcGUuY3VycmVudFVzZXIgPT09IG51bGwpIHtcbiAgICAgICAgJHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9hdXRoL3R3aXR0ZXInO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHNoYXJlID0gbmV3IFNoYXJlcyh7XG4gICAgICAgICAgc3RvY2s6IHN0b2NrLm5hbWUsXG4gICAgICAgICAgYW1vdW50OiBzdG9jay5hbW91bnRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2hhcmUuJHNhdmUoZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgaWYgKHJlcy5zdWNjZXNzID09PSBmYWxzZSkge1xuICAgICAgICAgICAgTm90aWZpY2F0aW9uLmVycm9yKHJlcy5tZXNzYWdlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgTm90aWZpY2F0aW9uLnN1Y2Nlc3MoJ1lvdSBib3VnaHQgJyArIHJlcy5zdG9jayArICchJyk7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLmN1cnJlbnRVc2VyID0gcmVzLm93bmVyO1xuICAgICAgICAgICAgJHNjb3BlLmdldFBvcnRmb2xpbygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgICRzY29wZS5zZWxsU2hhcmUgPSBmdW5jdGlvbihzaGFyZUlkKSB7XG4gICAgICB2YXIgc2hhcmUgPSBTaGFyZXMuZ2V0KHtcbiAgICAgICAgc2hhcmVJZCA6IHNoYXJlSWRcbiAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICBzaGFyZS4kZGVsZXRlKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIE5vdGlmaWNhdGlvbi5zdWNjZXNzKCdZb3Ugc29sZCAnICsgcmVzLnN0b2NrICsgJyEnKTtcbiAgICAgICAgICAkcm9vdFNjb3BlLmN1cnJlbnRVc2VyID0gcmVzLm93bmVyO1xuICAgICAgICAgICRzY29wZS5nZXRQb3J0Zm9saW8oKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLmdldFN0b2NrcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgU29ja2V0LmVtaXQoJ3VwZGF0ZS1tZScpO1xuICAgICAgJHNjb3BlLmdldFBvcnRmb2xpbygpO1xuICAgIH07XG5cbiAgICAkc2NvcGUuY2hhcnRPcHRpb25zID0ge1xuICAgICAgc2VyaWVzQmFyRGlzdGFuY2U6IDE1LFxuICAgICAgc2hvd0FyZWE6IHRydWVcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZ2V0UmFuZG9tSW50KG1pbiwgbWF4KSB7XG4gICAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikpICsgbWluO1xuICAgIH1cblxuICAgIC8vIFVwZGF0ZSBkYXRhXG5cbiAgICBTb2NrZXQub24oJ3R3ZWV0JywgZnVuY3Rpb24oZGF0YSl7XG5cbiAgICAgICRzY29wZS50d2VldCA9IGRhdGE7XG5cbiAgICB9KTtcblxuICAgIFNvY2tldC5vbignY3VycmVudENvdW50JywgZnVuY3Rpb24oZGF0YSl7XG5cbiAgICAgICRzY29wZS5jdXJyZW50Q291bnQgPSBkYXRhO1xuXG4gICAgfSk7XG5cbiAgICBTb2NrZXQub24oJ3VwZGF0ZScsIGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgICAgJHNjb3BlLnN0b2NrcyA9IGRhdGE7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgJHNjb3BlLnN0b2Nrcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgc3RvY2sgPSAkc2NvcGUuc3RvY2tzW2ldO1xuICAgICAgICB2YXIgZGF0YUxlbmdodCA9IHN0b2NrLmhpc3RvcnkubGVuZ3RoO1xuXG4gICAgICAgIC8vIEdldCB2YXJpYXRpb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICBpZiAoc3RvY2suY291bnQgPiAwICYmIGRhdGFMZW5naHQgPiAxKXtcbiAgICAgICAgICBpZiAoc3RvY2suaGlzdG9yeVsxXS5jb3VudCA+IDApe1xuICAgICAgICAgICAgLy8gKCAoY3VycmVudFByaWNlL2xhc3RQcmljZSktMSApICogMTAwXG4gICAgICAgICAgICB2YXIgdmFyaWF0aW9uTnVtYmVyID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgKCggc3RvY2suY291bnQgLyBzdG9jay5oaXN0b3J5WzFdLmNvdW50ICkgLSAxKSAqIDEwMDtcbiAgICAgICAgICAgIHN0b2NrLnZhcmlhdGlvbiA9IE1hdGgucm91bmQodmFyaWF0aW9uTnVtYmVyKS50b0ZpeGVkKDApICsgJyUnO1xuICAgICAgICAgICAgc3RvY2subGFzdE1vdmUgPSAodmFyaWF0aW9uTnVtYmVyIDwgMCkgPyAnZGFuZ2VyJyA6ICdzdWNjZXNzJztcbiAgICAgICAgICAgIHN0b2NrLmljb24gPSAodmFyaWF0aW9uTnVtYmVyIDwgMCkgPyAnZmEtY2FyZXQtZG93bicgOiAnZmEtY2FyZXQtdXAnO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgICAgICAvLyBQcmVwYXJlIGNoYXJ0IGRhdGEgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgdmFyIGNoYXJ0RGF0YSA9IHt9O1xuXG4gICAgICAgIGNoYXJ0RGF0YS5sYWJlbHMgPSBbXTtcbiAgICAgICAgY2hhcnREYXRhLnNlcmllcyA9IFtbXV07XG5cbiAgICAgICAgZm9yICh2YXIgaTIgPSBkYXRhTGVuZ2h0LTE7IGkyID49IDA7IGkyLS0pe1xuICAgICAgICAgIHZhciBkID0gbmV3IERhdGUoc3RvY2suaGlzdG9yeVtpMl0uY3JlYXRlZCk7XG4gICAgICAgICAgdmFyIGxhYmVsID0gZC5nZXRIb3VycygpICsgJzonICsgZC5nZXRNaW51dGVzKCk7XG5cbiAgICAgICAgICBjaGFydERhdGEuc2VyaWVzWzBdLnB1c2goc3RvY2suaGlzdG9yeVtpMl0uY291bnQpO1xuICAgICAgICAgIGNoYXJ0RGF0YS5sYWJlbHMucHVzaChsYWJlbCk7XG4gICAgICAgIH1cblxuICAgICAgICBzdG9jay5jaGFydERhdGEgPSBjaGFydERhdGE7XG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgfVxuXG4gICAgICAkc2NvcGUucmVzcG9uc2VSZWNlaXZlZCA9IHRydWU7XG4gICAgICAkc2NvcGUuZ2V0UG9ydGZvbGlvKCk7XG4gICAgfSk7XG5cbiAgICBTb2NrZXQub24oJ3VwZGF0ZS1kYXRlJywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgJHNjb3BlLnN0b2Nrc1VwZGF0ZWRBdCA9IG5ldyBEYXRlKGRhdGEpO1xuICAgIH0pO1xuICB9XG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgYW5ndWxhclxuICAgIC5tb2R1bGUoJ3R3ZWV0c3RvY2tyJylcbiAgICAuY29udHJvbGxlcignbG9nb3V0Q29udHJvbGxlcicsIGxvZ291dENvbnRyb2xsZXIpO1xuXG4gIGZ1bmN0aW9uIGxvZ291dENvbnRyb2xsZXIoQXV0aCwgJHdpbmRvdykge1xuXG4gICAgQXV0aC5sb2dvdXQoZnVuY3Rpb24oZXJyKSB7XG4gICAgICBpZighZXJyKSB7XG4gICAgICAgICR3aW5kb3cubG9jYXRpb24uaHJlZiA9ICdodHRwOi8vJyArICR3aW5kb3cubG9jYXRpb24uaG9zdCArICcvbG9nb3V0JztcbiAgICAgIH1cbiAgICB9KTtcblxuICB9XG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgYW5ndWxhclxuICAgIC5tb2R1bGUoJ3R3ZWV0c3RvY2tyJylcbiAgICAuY29udHJvbGxlcigncHJvZmlsZUNvbnRyb2xsZXInLCBwcm9maWxlQ29udHJvbGxlcik7XG5cbiAgZnVuY3Rpb24gcHJvZmlsZUNvbnRyb2xsZXIoJGxvY2F0aW9uLCBSZXNldEFjY291bnQsICR3aW5kb3csICRyb290U2NvcGUpIHtcbiAgICB2YXIgdm0gPSB0aGlzO1xuXG4gICAgLy8gU2V0dGluZyBuYW1lL3VzZXJuYW1lIHRvIG5hbWUvdXNlcm5hbWUgZmllbGQgb24gdmlldy5cbiAgICB2bS5uYW1lID0gJHJvb3RTY29wZS5jdXJyZW50VXNlci5uYW1lXG4gICAgdm0udXNlcm5hbWUgPSAkcm9vdFNjb3BlLmN1cnJlbnRVc2VyLnVzZXJuYW1lXG5cbiAgICB2bS5yZXNldEFjY291bnQgPSBmdW5jdGlvbigpIHtcbiAgICAgIFJlc2V0QWNjb3VudC5zYXZlKFxuICAgICAgICBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICAkd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnaHR0cDovLycgKyAkd2luZG93LmxvY2F0aW9uLmhvc3Q7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICB2bS5vcGVuTW9kYWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2bS5jb25maXJtTW9kYWwgPSB0cnVlO1xuICAgIH1cblxuICAgIHZtLmNsb3NlTW9kYWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2bS5jb25maXJtTW9kYWwgPSBmYWxzZTtcbiAgICB9XG4gIH1cbn0pKCk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBhbmd1bGFyXG4gICAgLm1vZHVsZSgndHdlZXRzdG9ja3InKVxuICAgIC5jb250cm9sbGVyKCdyYW5raW5nQ29udHJvbGxlcicsIHJhbmtpbmdDb250cm9sbGVyKTtcblxuICBmdW5jdGlvbiByYW5raW5nQ29udHJvbGxlcihSYW5raW5nKSB7XG4gICAgdmFyIHZtID0gdGhpcztcblxuICAgIHZtLmZpbmQgPSBmdW5jdGlvbigpIHtcbiAgICAgIFJhbmtpbmcucXVlcnkoZnVuY3Rpb24ocmFua2luZykge1xuICAgICAgICB2bS51c2VycyA9IHJhbmtpbmc7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgdm0uZmluZCgpO1xuICB9XG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgYW5ndWxhclxuICAgIC5tb2R1bGUoJ3R3ZWV0c3RvY2tyJylcbiAgICAuZGlyZWN0aXZlKCdmb290ZXJiYXInLCBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ3NoYXJlZC9mb290ZXJiYXInXG4gICAgICB9O1xuICAgIH0pO1xufSkoKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGFuZ3VsYXJcbiAgICAubW9kdWxlKCd0d2VldHN0b2NrcicpXG4gICAgLmRpcmVjdGl2ZSgnbmF2YmFyJywgZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdzaGFyZWQvbmF2YmFyJ1xuICAgICAgfTtcbiAgICB9KTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgYW5ndWxhclxuICAgIC5tb2R1bGUoJ3R3ZWV0c3RvY2tyJylcbiAgICAuZmFjdG9yeSgnQXV0aCcsIEF1dGgpO1xuXG4gIGZ1bmN0aW9uIEF1dGgoJHJvb3RTY29wZSwgJGNvb2tpZXMsICRyZXNvdXJjZSkge1xuICAgICRyb290U2NvcGUuY3VycmVudFVzZXIgPSBhbmd1bGFyLmZyb21Kc29uKCRjb29raWVzLmdldCgndXNlcicpKSB8fCBudWxsO1xuICAgICRjb29raWVzLnJlbW92ZSgndXNlcicpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGN1cnJlbnRVc2VyOiBmdW5jdGlvbigpIHt9LFxuICAgICAgbG9nb3V0OiBmdW5jdGlvbihjYil7XG4gICAgICAgICRyb290U2NvcGUuY3VycmVudFVzZXIgPSBudWxsO1xuICAgICAgICAkY29va2llcy5yZW1vdmUoJ3VzZXInKTtcbiAgICAgICAgY2IoKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgYW5ndWxhclxuICAgIC5tb2R1bGUoJ3R3ZWV0c3RvY2tyJylcbiAgICAuZmFjdG9yeSgnUG9ydGZvbGlvJywgUG9ydGZvbGlvKTtcblxuICBmdW5jdGlvbiBQb3J0Zm9saW8oJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZSgnYXBpL3BvcnRmb2xpby8nKTtcbiAgfVxufSkoKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGFuZ3VsYXJcbiAgICAubW9kdWxlKCd0d2VldHN0b2NrcicpXG4gICAgLmZhY3RvcnkoJ1JhbmtpbmcnLCBSYW5raW5nKTtcblxuICBmdW5jdGlvbiBSYW5raW5nKCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoJ2FwaS9yYW5raW5nLycpO1xuICB9XG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgYW5ndWxhclxuICAgIC5tb2R1bGUoJ3R3ZWV0c3RvY2tyJylcbiAgICAuZmFjdG9yeSgnUmVzZXRBY2NvdW50JywgUmVzZXRBY2NvdW50KTtcblxuICBmdW5jdGlvbiBSZXNldEFjY291bnQoJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZSgnL2F1dGgvcmVzZXQvOnVzZXJJZCcpO1xuICB9XG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gaG93IGl0IHdvcmtzIGhlcmU6XG4gIC8vIGh0dHA6Ly93d3cuc2l0ZXBvaW50LmNvbS9jcmVhdGluZy1jcnVkLWFwcC1taW51dGVzLWFuZ3VsYXJzLXJlc291cmNlL1xuXG4gIGFuZ3VsYXJcbiAgICAubW9kdWxlKCd0d2VldHN0b2NrcicpXG4gICAgLmZhY3RvcnkoJ1NoYXJlcycsIFNoYXJlcyk7XG5cbiAgZnVuY3Rpb24gU2hhcmVzKCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoJ2FwaS9zaGFyZXMvOnNoYXJlSWQnLCB7XG4gICAgICBzaGFyZUlkOiAnQF9pZCdcbiAgICB9LCB7XG4gICAgICB1cGRhdGU6IHtcbiAgICAgICAgbWV0aG9kOiAnUFVUJ1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgYW5ndWxhclxuICAgIC5tb2R1bGUoJ3R3ZWV0c3RvY2tyJylcbiAgICAuZmFjdG9yeSgnU29ja2V0JywgU29ja2V0KTtcblxuICBmdW5jdGlvbiBTb2NrZXQoJHJvb3RTY29wZSkge1xuICAgIHZhciBzb2NrZXQgPSBpby5jb25uZWN0KCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgb246IGZ1bmN0aW9uIChldmVudE5hbWUsIGNhbGxiYWNrKSB7XG4gICAgICAgIGZ1bmN0aW9uIHdyYXBwZXIoKSB7XG4gICAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgICAgJHJvb3RTY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkoc29ja2V0LCBhcmdzKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNvY2tldC5vbihldmVudE5hbWUsIHdyYXBwZXIpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgc29ja2V0LnJlbW92ZUxpc3RlbmVyKGV2ZW50TmFtZSwgd3JhcHBlcik7XG4gICAgICAgIH07XG4gICAgICB9LFxuICAgICAgZW1pdDogZnVuY3Rpb24gKGV2ZW50TmFtZSwgZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgICAgc29ja2V0LmVtaXQoZXZlbnROYW1lLCBkYXRhLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgICAgJHJvb3RTY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkoc29ja2V0LCBhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufSkoKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGFuZ3VsYXJcbiAgICAubW9kdWxlKCd0d2VldHN0b2NrcicpXG4gICAgLmZhY3RvcnkoJ1VzZXInLCBVc2VyKTtcblxuICBmdW5jdGlvbiBVc2VyKCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoJy9hdXRoL3VzZXIvOmlkLycsIHt9LFxuICAgIHtcbiAgICAgICd1cGRhdGUnOiB7XG4gICAgICAgIG1ldGhvZDonUFVUJ1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59KSgpO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
