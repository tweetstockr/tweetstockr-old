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
            var variationNumber = (( stock.count / stock.history[1].count ) - 1) * 100;
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
        templateUrl: 'shared/footerbar',
        replace: true
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
        templateUrl: 'shared/navbar',
        replace: true
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsIm9yZGluYWwuanMiLCJhYm91dENvbnRyb2xsZXIuanMiLCJob21lQ29udHJvbGxlci5qcyIsImxvZ291dENvbnRyb2xsZXIuanMiLCJwcm9maWxlQ29udHJvbGxlci5qcyIsInJhbmtpbmdDb250cm9sbGVyLmpzIiwiZm9vdGVyYmFyLmpzIiwibmF2YmFyLmpzIiwiQXV0aC5qcyIsIlBvcnRmb2xpby5qcyIsIlJhbmtpbmcuanMiLCJSZXNldEFjY291bnQuanMiLCJTaGFyZXMuanMiLCJTb2NrZXQuanMiLCJVc2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgYW5ndWxhclxuICAgIC5tb2R1bGUoJ3R3ZWV0c3RvY2tyJywgW1xuICAgICAgJ25nUmVzb3VyY2UnLFxuICAgICAgJ25nUm91dGUnLFxuICAgICAgJ25nQ29va2llcycsXG4gICAgICAnYW5ndWxhci1jaGFydGlzdCcsXG4gICAgICAndWktbm90aWZpY2F0aW9uJ1xuICAgIF0pXG4gICAgLmNvbmZpZyhmdW5jdGlvbigkcm91dGVQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIsIE5vdGlmaWNhdGlvblByb3ZpZGVyKSB7XG4gICAgICAkcm91dGVQcm92aWRlclxuICAgICAgLndoZW4oJy9ob21lJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ3BhcnRpYWxzL2hvbWUnLFxuICAgICAgICBjb250cm9sbGVyOiAnaG9tZUNvbnRyb2xsZXInXG4gICAgICB9KVxuXG4gICAgICAud2hlbignL3Byb2ZpbGUnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAncGFydGlhbHMvcHJvZmlsZScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdwcm9maWxlQ29udHJvbGxlcicsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJ3Byb2ZpbGUnXG4gICAgICB9KVxuXG4gICAgICAud2hlbignL2xvZ291dCcsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdwYXJ0aWFscy9sb2dvdXQnLFxuICAgICAgICBjb250cm9sbGVyOiAnbG9nb3V0Q29udHJvbGxlcicsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJ2xvZ291dCdcbiAgICAgIH0pXG5cbiAgICAgIC53aGVuKCcvcmFua2luZycsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdwYXJ0aWFscy9yYW5raW5nJyxcbiAgICAgICAgY29udHJvbGxlcjogJ3JhbmtpbmdDb250cm9sbGVyJyxcbiAgICAgICAgY29udHJvbGxlckFzOiAncmFua2luZydcbiAgICAgIH0pXG5cbiAgICAgIC53aGVuKCcvYWJvdXQnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAncGFydGlhbHMvYWJvdXQnLFxuICAgICAgICBjb250cm9sbGVyOiAnYWJvdXRDb250cm9sbGVyJyxcbiAgICAgICAgY29udHJvbGxlckFzOiAnYWJvdXQnXG4gICAgICB9KVxuXG4gICAgICAub3RoZXJ3aXNlKHtcbiAgICAgICAgcmVkaXJlY3RUbzogJy9ob21lJ1xuICAgICAgfSk7XG5cbiAgICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTtcblxuICAgICAgTm90aWZpY2F0aW9uUHJvdmlkZXIuc2V0T3B0aW9ucyh7XG4gICAgICAgIGRlbGF5OiA1MDAwLFxuICAgICAgICBzdGFydFRvcDogMjAsXG4gICAgICAgIHN0YXJ0UmlnaHQ6IDIwLFxuICAgICAgICB2ZXJ0aWNhbFNwYWNpbmc6IDIwLFxuICAgICAgICBob3Jpem9udGFsU3BhY2luZzogMjAsXG4gICAgICAgIHBvc2l0aW9uWDogJ3JpZ2h0JyxcbiAgICAgICAgcG9zaXRpb25ZOiAndG9wJ1xuICAgICAgfSk7XG4gICAgfSlcblxuICAgIC5ydW4oZnVuY3Rpb24gKCRyb290U2NvcGUsICRsb2NhdGlvbiwgQXV0aCkge1xuICAgICAgLy93YXRjaGluZyB0aGUgdmFsdWUgb2YgdGhlIGN1cnJlbnRVc2VyIHZhcmlhYmxlLlxuICAgICAgJHJvb3RTY29wZS4kd2F0Y2goJ2N1cnJlbnRVc2VyJywgZnVuY3Rpb24oY3VycmVudFVzZXIpIHtcbiAgICAgICAgQXV0aC5jdXJyZW50VXNlcigpO1xuICAgICAgfSk7XG4gICAgfSk7XG59KSgpO1xuIiwiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkoezE6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgb3JkaW5hbCA9IHJlcXVpcmUoJ29yZGluYWwtbnVtYmVyLXN1ZmZpeCcpO1xuXG5hbmd1bGFyXG4gIC5tb2R1bGUoJ3R3ZWV0c3RvY2tyJylcblxuICAvLyBUYWtlIGEgbnVtYmVyIGFuZCByZXR1cm5zIGl0cyBvcmRpbmFsIHZhbHVlXG4gIC8vIGkuZS4gMSAtPiAxc3QsIDIgLT4gMm5kLCBldGMuXG4gIC5maWx0ZXIoJ29yZGluYWwnLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgIHZhciBudW0gPSBwYXJzZUludChpbnB1dCwgMTApO1xuICAgICAgcmV0dXJuIGlzTmFOKG51bSkgPyBpbnB1dCA6IG9yZGluYWwobnVtKTtcbiAgICB9O1xuICB9KTtcblxufSx7XCJvcmRpbmFsLW51bWJlci1zdWZmaXhcIjoyfV0sMjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5cbi8qKlxuICogR2V0IHRoZSBvcmRpbmFsIG51bWJlciB3aXRoIHN1ZmZpeCBmcm9tIGBuYFxuICpcbiAqIEBhcGkgcHVibGljXG4gKiBAcGFyYW0ge051bWJlcn0gblxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobikge1xuICByZXR1cm4gbiArIGV4cG9ydHMuc3VmZml4KCtuKTtcbn07XG5cbi8qKlxuICogR2V0IHRoZSBzdWZmaXggZm9yIHRoZSBnaXZlbiBgbmBcbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBuXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMuc3VmZml4ID0gZnVuY3Rpb24gKG4pIHtcbiAgcmV0dXJuIE1hdGguZmxvb3IobiAvIDEwKSA9PT0gMVxuICAgICAgPyAndGgnXG4gICAgICA6IChuICUgMTAgPT09IDFcbiAgICAgICAgPyAnc3QnXG4gICAgICAgIDogKG4gJSAxMCA9PT0gMlxuICAgICAgICAgID8gJ25kJ1xuICAgICAgICAgIDogKG4gJSAxMCA9PT0gM1xuICAgICAgICAgICAgPyAncmQnXG4gICAgICAgICAgICA6ICd0aCcpKSk7XG59O1xuXG59LHt9XX0se30sWzFdKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGFuZ3VsYXJcbiAgICAubW9kdWxlKCd0d2VldHN0b2NrcicpXG4gICAgLmNvbnRyb2xsZXIoJ2Fib3V0Q29udHJvbGxlcicsIGFib3V0Q29udHJvbGxlcik7XG5cbiAgZnVuY3Rpb24gYWJvdXRDb250cm9sbGVyKCkge1xuXG5cblxuICB9XG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgYW5ndWxhclxuICAgIC5tb2R1bGUoJ3R3ZWV0c3RvY2tyJylcbiAgICAuY29udHJvbGxlcignaG9tZUNvbnRyb2xsZXInLCBob21lQ29udHJvbGxlcik7XG5cbiAgZnVuY3Rpb24gaG9tZUNvbnRyb2xsZXIoJHNjb3BlLCBTb2NrZXQsIFBvcnRmb2xpbywgU2hhcmVzLCAkaW50ZXJ2YWwsICR0aW1lb3V0LCAkcm9vdFNjb3BlLCBOb3RpZmljYXRpb24sICR3aW5kb3cpIHtcbiAgICAkc2NvcGUucG9pbnRzID0gZmFsc2U7XG4gICAgJHNjb3BlLnZhcmlhdGlvbiA9IGZhbHNlO1xuXG4gICAgY29uc29sZS5sb2coJHJvb3RTY29wZS5jdXJyZW50VXNlcik7XG5cbiAgICAkc2NvcGUuZ2V0UG9ydGZvbGlvID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoJHNjb3BlLmN1cnJlbnRVc2VyKSB7XG4gICAgICAgIFBvcnRmb2xpby5xdWVyeShmdW5jdGlvbihzaGFyZXMpIHtcbiAgICAgICAgICAkc2NvcGUucG9ydGZvbGlvID0gc2hhcmVzO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgJHNjb3BlLmJ1eVNoYXJlID0gZnVuY3Rpb24oc3RvY2spIHtcbiAgICAgIGlmKCRyb290U2NvcGUuY3VycmVudFVzZXIgPT09IG51bGwpIHtcbiAgICAgICAgJHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9hdXRoL3R3aXR0ZXInO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHNoYXJlID0gbmV3IFNoYXJlcyh7XG4gICAgICAgICAgc3RvY2s6IHN0b2NrLm5hbWUsXG4gICAgICAgICAgYW1vdW50OiBzdG9jay5hbW91bnRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2hhcmUuJHNhdmUoZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgaWYgKHJlcy5zdWNjZXNzID09PSBmYWxzZSkge1xuICAgICAgICAgICAgTm90aWZpY2F0aW9uLmVycm9yKHJlcy5tZXNzYWdlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgTm90aWZpY2F0aW9uLnN1Y2Nlc3MoJ1lvdSBib3VnaHQgJyArIHJlcy5zdG9jayArICchJyk7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLmN1cnJlbnRVc2VyID0gcmVzLm93bmVyO1xuICAgICAgICAgICAgJHNjb3BlLmdldFBvcnRmb2xpbygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgICRzY29wZS5zZWxsU2hhcmUgPSBmdW5jdGlvbihzaGFyZUlkKSB7XG4gICAgICB2YXIgc2hhcmUgPSBTaGFyZXMuZ2V0KHtcbiAgICAgICAgc2hhcmVJZCA6IHNoYXJlSWRcbiAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICBzaGFyZS4kZGVsZXRlKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIE5vdGlmaWNhdGlvbi5zdWNjZXNzKCdZb3Ugc29sZCAnICsgcmVzLnN0b2NrICsgJyEnKTtcbiAgICAgICAgICAkcm9vdFNjb3BlLmN1cnJlbnRVc2VyID0gcmVzLm93bmVyO1xuICAgICAgICAgICRzY29wZS5nZXRQb3J0Zm9saW8oKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLmdldFN0b2NrcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgU29ja2V0LmVtaXQoJ3VwZGF0ZS1tZScpO1xuICAgICAgJHNjb3BlLmdldFBvcnRmb2xpbygpO1xuICAgIH07XG5cbiAgICAkc2NvcGUuY2hhcnRPcHRpb25zID0ge1xuICAgICAgc2VyaWVzQmFyRGlzdGFuY2U6IDE1LFxuICAgICAgc2hvd0FyZWE6IHRydWVcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZ2V0UmFuZG9tSW50KG1pbiwgbWF4KSB7XG4gICAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikpICsgbWluO1xuICAgIH1cblxuICAgIC8vIFVwZGF0ZSBkYXRhXG5cbiAgICBTb2NrZXQub24oJ3R3ZWV0JywgZnVuY3Rpb24oZGF0YSl7XG5cbiAgICAgICRzY29wZS50d2VldCA9IGRhdGE7XG5cbiAgICB9KTtcblxuICAgIFNvY2tldC5vbignY3VycmVudENvdW50JywgZnVuY3Rpb24oZGF0YSl7XG5cbiAgICAgICRzY29wZS5jdXJyZW50Q291bnQgPSBkYXRhO1xuXG4gICAgfSk7XG5cbiAgICBTb2NrZXQub24oJ3VwZGF0ZScsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICRzY29wZS5zdG9ja3MgPSBkYXRhO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8ICRzY29wZS5zdG9ja3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHN0b2NrID0gJHNjb3BlLnN0b2Nrc1tpXTtcbiAgICAgICAgdmFyIGRhdGFMZW5naHQgPSBzdG9jay5oaXN0b3J5Lmxlbmd0aDtcblxuICAgICAgICAvLyBHZXQgdmFyaWF0aW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgaWYgKHN0b2NrLmNvdW50ID4gMCAmJiBkYXRhTGVuZ2h0ID4gMSl7XG4gICAgICAgICAgaWYgKHN0b2NrLmhpc3RvcnlbMV0uY291bnQgPiAwKXtcbiAgICAgICAgICAgIC8vICggKGN1cnJlbnRQcmljZS9sYXN0UHJpY2UpLTEgKSAqIDEwMFxuICAgICAgICAgICAgdmFyIHZhcmlhdGlvbk51bWJlciA9ICgoIHN0b2NrLmNvdW50IC8gc3RvY2suaGlzdG9yeVsxXS5jb3VudCApIC0gMSkgKiAxMDA7XG4gICAgICAgICAgICBzdG9jay52YXJpYXRpb24gPSBNYXRoLnJvdW5kKHZhcmlhdGlvbk51bWJlcikudG9GaXhlZCgwKSArICclJztcbiAgICAgICAgICAgIHN0b2NrLmxhc3RNb3ZlID0gKHZhcmlhdGlvbk51bWJlciA8IDApID8gJ2RhbmdlcicgOiAnc3VjY2Vzcyc7XG4gICAgICAgICAgICBzdG9jay5pY29uID0gKHZhcmlhdGlvbk51bWJlciA8IDApID8gJ2ZhLWNhcmV0LWRvd24nIDogJ2ZhLWNhcmV0LXVwJztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAgICAgLy8gUHJlcGFyZSBjaGFydCBkYXRhIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIHZhciBjaGFydERhdGEgPSB7fTtcblxuICAgICAgICBjaGFydERhdGEubGFiZWxzID0gW107XG4gICAgICAgIGNoYXJ0RGF0YS5zZXJpZXMgPSBbW11dO1xuXG4gICAgICAgIGZvciAodmFyIGkyID0gZGF0YUxlbmdodC0xOyBpMiA+PSAwOyBpMi0tKXtcbiAgICAgICAgICB2YXIgZCA9IG5ldyBEYXRlKHN0b2NrLmhpc3RvcnlbaTJdLmNyZWF0ZWQpO1xuICAgICAgICAgIHZhciBsYWJlbCA9IGQuZ2V0SG91cnMoKSArICc6JyArIGQuZ2V0TWludXRlcygpO1xuXG4gICAgICAgICAgY2hhcnREYXRhLnNlcmllc1swXS5wdXNoKHN0b2NrLmhpc3RvcnlbaTJdLmNvdW50KTtcbiAgICAgICAgICBjaGFydERhdGEubGFiZWxzLnB1c2gobGFiZWwpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RvY2suY2hhcnREYXRhID0gY2hhcnREYXRhO1xuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgIH1cblxuICAgICAgJHNjb3BlLnJlc3BvbnNlUmVjZWl2ZWQgPSB0cnVlO1xuICAgICAgJHNjb3BlLmdldFBvcnRmb2xpbygpO1xuICAgIH0pO1xuXG4gICAgU29ja2V0Lm9uKCd1cGRhdGUtZGF0ZScsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICRzY29wZS5zdG9ja3NVcGRhdGVkQXQgPSBuZXcgRGF0ZShkYXRhKTtcbiAgICB9KTtcbiAgfVxufSkoKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGFuZ3VsYXJcbiAgICAubW9kdWxlKCd0d2VldHN0b2NrcicpXG4gICAgLmNvbnRyb2xsZXIoJ2xvZ291dENvbnRyb2xsZXInLCBsb2dvdXRDb250cm9sbGVyKTtcblxuICBmdW5jdGlvbiBsb2dvdXRDb250cm9sbGVyKEF1dGgsICR3aW5kb3cpIHtcblxuICAgIEF1dGgubG9nb3V0KGZ1bmN0aW9uKGVycikge1xuICAgICAgaWYoIWVycikge1xuICAgICAgICAkd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnaHR0cDovLycgKyAkd2luZG93LmxvY2F0aW9uLmhvc3QgKyAnL2xvZ291dCc7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgfVxufSkoKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGFuZ3VsYXJcbiAgICAubW9kdWxlKCd0d2VldHN0b2NrcicpXG4gICAgLmNvbnRyb2xsZXIoJ3Byb2ZpbGVDb250cm9sbGVyJywgcHJvZmlsZUNvbnRyb2xsZXIpO1xuXG4gIGZ1bmN0aW9uIHByb2ZpbGVDb250cm9sbGVyKCRsb2NhdGlvbiwgUmVzZXRBY2NvdW50LCAkd2luZG93LCAkcm9vdFNjb3BlKSB7XG4gICAgdmFyIHZtID0gdGhpcztcblxuICAgIC8vIFNldHRpbmcgbmFtZS91c2VybmFtZSB0byBuYW1lL3VzZXJuYW1lIGZpZWxkIG9uIHZpZXcuXG4gICAgdm0ubmFtZSA9ICRyb290U2NvcGUuY3VycmVudFVzZXIubmFtZVxuICAgIHZtLnVzZXJuYW1lID0gJHJvb3RTY29wZS5jdXJyZW50VXNlci51c2VybmFtZVxuXG4gICAgdm0ucmVzZXRBY2NvdW50ID0gZnVuY3Rpb24oKSB7XG4gICAgICBSZXNldEFjY291bnQuc2F2ZShcbiAgICAgICAgZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgJHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJ2h0dHA6Ly8nICsgJHdpbmRvdy5sb2NhdGlvbi5ob3N0O1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgdm0ub3Blbk1vZGFsID0gZnVuY3Rpb24gKCkge1xuICAgICAgdm0uY29uZmlybU1vZGFsID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB2bS5jbG9zZU1vZGFsID0gZnVuY3Rpb24gKCkge1xuICAgICAgdm0uY29uZmlybU1vZGFsID0gZmFsc2U7XG4gICAgfVxuICB9XG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgYW5ndWxhclxuICAgIC5tb2R1bGUoJ3R3ZWV0c3RvY2tyJylcbiAgICAuY29udHJvbGxlcigncmFua2luZ0NvbnRyb2xsZXInLCByYW5raW5nQ29udHJvbGxlcik7XG5cbiAgZnVuY3Rpb24gcmFua2luZ0NvbnRyb2xsZXIoUmFua2luZykge1xuICAgIHZhciB2bSA9IHRoaXM7XG5cbiAgICB2bS5maW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICBSYW5raW5nLnF1ZXJ5KGZ1bmN0aW9uKHJhbmtpbmcpIHtcbiAgICAgICAgdm0udXNlcnMgPSByYW5raW5nO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHZtLmZpbmQoKTtcbiAgfVxufSkoKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGFuZ3VsYXJcbiAgICAubW9kdWxlKCd0d2VldHN0b2NrcicpXG4gICAgLmRpcmVjdGl2ZSgnZm9vdGVyYmFyJywgZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdzaGFyZWQvZm9vdGVyYmFyJyxcbiAgICAgICAgcmVwbGFjZTogdHJ1ZVxuICAgICAgfTtcbiAgICB9KTtcbn0pKCk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBhbmd1bGFyXG4gICAgLm1vZHVsZSgndHdlZXRzdG9ja3InKVxuICAgIC5kaXJlY3RpdmUoJ25hdmJhcicsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnc2hhcmVkL25hdmJhcicsXG4gICAgICAgIHJlcGxhY2U6IHRydWVcbiAgICAgIH07XG4gICAgfSk7XG59KSgpOyIsIihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGFuZ3VsYXJcbiAgICAubW9kdWxlKCd0d2VldHN0b2NrcicpXG4gICAgLmZhY3RvcnkoJ0F1dGgnLCBBdXRoKTtcblxuICBmdW5jdGlvbiBBdXRoKCRyb290U2NvcGUsICRjb29raWVzLCAkcmVzb3VyY2UpIHtcbiAgICAkcm9vdFNjb3BlLmN1cnJlbnRVc2VyID0gYW5ndWxhci5mcm9tSnNvbigkY29va2llcy5nZXQoJ3VzZXInKSkgfHwgbnVsbDtcbiAgICAkY29va2llcy5yZW1vdmUoJ3VzZXInKTtcblxuICAgIHJldHVybiB7XG4gICAgICBjdXJyZW50VXNlcjogZnVuY3Rpb24oKSB7fSxcbiAgICAgIGxvZ291dDogZnVuY3Rpb24oY2Ipe1xuICAgICAgICAkcm9vdFNjb3BlLmN1cnJlbnRVc2VyID0gbnVsbDtcbiAgICAgICAgJGNvb2tpZXMucmVtb3ZlKCd1c2VyJyk7XG4gICAgICAgIGNiKCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufSkoKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGFuZ3VsYXJcbiAgICAubW9kdWxlKCd0d2VldHN0b2NrcicpXG4gICAgLmZhY3RvcnkoJ1BvcnRmb2xpbycsIFBvcnRmb2xpbyk7XG5cbiAgZnVuY3Rpb24gUG9ydGZvbGlvKCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoJ2FwaS9wb3J0Zm9saW8vJyk7XG4gIH1cbn0pKCk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBhbmd1bGFyXG4gICAgLm1vZHVsZSgndHdlZXRzdG9ja3InKVxuICAgIC5mYWN0b3J5KCdSYW5raW5nJywgUmFua2luZyk7XG5cbiAgZnVuY3Rpb24gUmFua2luZygkcmVzb3VyY2UpIHtcbiAgICByZXR1cm4gJHJlc291cmNlKCdhcGkvcmFua2luZy8nKTtcbiAgfVxufSkoKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGFuZ3VsYXJcbiAgICAubW9kdWxlKCd0d2VldHN0b2NrcicpXG4gICAgLmZhY3RvcnkoJ1Jlc2V0QWNjb3VudCcsIFJlc2V0QWNjb3VudCk7XG5cbiAgZnVuY3Rpb24gUmVzZXRBY2NvdW50KCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoJy9hdXRoL3Jlc2V0Lzp1c2VySWQnKTtcbiAgfVxufSkoKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIGhvdyBpdCB3b3JrcyBoZXJlOlxuICAvLyBodHRwOi8vd3d3LnNpdGVwb2ludC5jb20vY3JlYXRpbmctY3J1ZC1hcHAtbWludXRlcy1hbmd1bGFycy1yZXNvdXJjZS9cblxuICBhbmd1bGFyXG4gICAgLm1vZHVsZSgndHdlZXRzdG9ja3InKVxuICAgIC5mYWN0b3J5KCdTaGFyZXMnLCBTaGFyZXMpO1xuXG4gIGZ1bmN0aW9uIFNoYXJlcygkcmVzb3VyY2UpIHtcbiAgICByZXR1cm4gJHJlc291cmNlKCdhcGkvc2hhcmVzLzpzaGFyZUlkJywge1xuICAgICAgc2hhcmVJZDogJ0BfaWQnXG4gICAgfSwge1xuICAgICAgdXBkYXRlOiB7XG4gICAgICAgIG1ldGhvZDogJ1BVVCdcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufSkoKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGFuZ3VsYXJcbiAgICAubW9kdWxlKCd0d2VldHN0b2NrcicpXG4gICAgLmZhY3RvcnkoJ1NvY2tldCcsIFNvY2tldCk7XG5cbiAgZnVuY3Rpb24gU29ja2V0KCRyb290U2NvcGUpIHtcbiAgICB2YXIgc29ja2V0ID0gaW8uY29ubmVjdCgpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIG9uOiBmdW5jdGlvbiAoZXZlbnROYW1lLCBjYWxsYmFjaykge1xuICAgICAgICBmdW5jdGlvbiB3cmFwcGVyKCkge1xuICAgICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAgICRyb290U2NvcGUuJGFwcGx5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KHNvY2tldCwgYXJncyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBzb2NrZXQub24oZXZlbnROYW1lLCB3cmFwcGVyKTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHNvY2tldC5yZW1vdmVMaXN0ZW5lcihldmVudE5hbWUsIHdyYXBwZXIpO1xuICAgICAgICB9O1xuICAgICAgfSxcbiAgICAgIGVtaXQ6IGZ1bmN0aW9uIChldmVudE5hbWUsIGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICAgIHNvY2tldC5lbWl0KGV2ZW50TmFtZSwgZGF0YSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAgICRyb290U2NvcGUuJGFwcGx5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KHNvY2tldCwgYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn0pKCk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBhbmd1bGFyXG4gICAgLm1vZHVsZSgndHdlZXRzdG9ja3InKVxuICAgIC5mYWN0b3J5KCdVc2VyJywgVXNlcik7XG5cbiAgZnVuY3Rpb24gVXNlcigkcmVzb3VyY2UpIHtcbiAgICByZXR1cm4gJHJlc291cmNlKCcvYXV0aC91c2VyLzppZC8nLCB7fSxcbiAgICB7XG4gICAgICAndXBkYXRlJzoge1xuICAgICAgICBtZXRob2Q6J1BVVCdcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufSkoKTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
