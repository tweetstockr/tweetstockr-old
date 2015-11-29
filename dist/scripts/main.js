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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsIm9yZGluYWwuanMiLCJob21lQ29udHJvbGxlci5qcyIsImxvZ291dENvbnRyb2xsZXIuanMiLCJwcm9maWxlQ29udHJvbGxlci5qcyIsInJhbmtpbmdDb250cm9sbGVyLmpzIiwibmF2YmFyLmpzIiwiQXV0aC5qcyIsIlBvcnRmb2xpby5qcyIsIlJhbmtpbmcuanMiLCJSZXNldEFjY291bnQuanMiLCJTaGFyZXMuanMiLCJTb2NrZXQuanMiLCJVc2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgYW5ndWxhclxuICAgIC5tb2R1bGUoJ3R3ZWV0c3RvY2tyJywgW1xuICAgICAgJ25nUmVzb3VyY2UnLFxuICAgICAgJ25nUm91dGUnLFxuICAgICAgJ25nQ29va2llcycsXG4gICAgICAnYW5ndWxhci1jaGFydGlzdCcsXG4gICAgICAndWktbm90aWZpY2F0aW9uJ1xuICAgIF0pXG4gICAgLmNvbmZpZyhmdW5jdGlvbigkcm91dGVQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIsIE5vdGlmaWNhdGlvblByb3ZpZGVyKSB7XG4gICAgICAkcm91dGVQcm92aWRlclxuICAgICAgLndoZW4oJy9ob21lJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ3BhcnRpYWxzL2hvbWUnLFxuICAgICAgICBjb250cm9sbGVyOiAnaG9tZUNvbnRyb2xsZXInXG4gICAgICB9KVxuXG4gICAgICAud2hlbignL3Byb2ZpbGUnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAncGFydGlhbHMvcHJvZmlsZScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdwcm9maWxlQ29udHJvbGxlcicsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJ3Byb2ZpbGUnXG4gICAgICB9KVxuXG4gICAgICAud2hlbignL2xvZ291dCcsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdwYXJ0aWFscy9sb2dvdXQnLFxuICAgICAgICBjb250cm9sbGVyOiAnbG9nb3V0Q29udHJvbGxlcicsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJ2xvZ291dCdcbiAgICAgIH0pXG5cbiAgICAgIC53aGVuKCcvcmFua2luZycsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdwYXJ0aWFscy9yYW5raW5nJyxcbiAgICAgICAgY29udHJvbGxlcjogJ3JhbmtpbmdDb250cm9sbGVyJyxcbiAgICAgICAgY29udHJvbGxlckFzOiAncmFua2luZydcbiAgICAgIH0pXG5cbiAgICAgIC5vdGhlcndpc2Uoe1xuICAgICAgICByZWRpcmVjdFRvOiAnL2hvbWUnXG4gICAgICB9KTtcblxuICAgICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xuXG4gICAgICBOb3RpZmljYXRpb25Qcm92aWRlci5zZXRPcHRpb25zKHtcbiAgICAgICAgZGVsYXk6IDUwMDAsXG4gICAgICAgIHN0YXJ0VG9wOiAyMCxcbiAgICAgICAgc3RhcnRSaWdodDogMjAsXG4gICAgICAgIHZlcnRpY2FsU3BhY2luZzogMjAsXG4gICAgICAgIGhvcml6b250YWxTcGFjaW5nOiAyMCxcbiAgICAgICAgcG9zaXRpb25YOiAncmlnaHQnLFxuICAgICAgICBwb3NpdGlvblk6ICd0b3AnXG4gICAgICB9KTtcbiAgICB9KVxuXG4gICAgLnJ1bihmdW5jdGlvbiAoJHJvb3RTY29wZSwgJGxvY2F0aW9uLCBBdXRoKSB7XG4gICAgICAvL3dhdGNoaW5nIHRoZSB2YWx1ZSBvZiB0aGUgY3VycmVudFVzZXIgdmFyaWFibGUuXG4gICAgICAkcm9vdFNjb3BlLiR3YXRjaCgnY3VycmVudFVzZXInLCBmdW5jdGlvbihjdXJyZW50VXNlcikge1xuICAgICAgICBBdXRoLmN1cnJlbnRVc2VyKCk7XG4gICAgICB9KTtcbiAgICB9KTtcbn0pKCk7XG4iLCIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSh7MTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBvcmRpbmFsID0gcmVxdWlyZSgnb3JkaW5hbC1udW1iZXItc3VmZml4Jyk7XG5cbmFuZ3VsYXJcbiAgLm1vZHVsZSgndHdlZXRzdG9ja3InKVxuXG4gIC8vIFRha2UgYSBudW1iZXIgYW5kIHJldHVybnMgaXRzIG9yZGluYWwgdmFsdWVcbiAgLy8gaS5lLiAxIC0+IDFzdCwgMiAtPiAybmQsIGV0Yy5cbiAgLmZpbHRlcignb3JkaW5hbCcsIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgdmFyIG51bSA9IHBhcnNlSW50KGlucHV0LCAxMCk7XG4gICAgICByZXR1cm4gaXNOYU4obnVtKSA/IGlucHV0IDogb3JkaW5hbChudW0pO1xuICAgIH07XG4gIH0pO1xuXG59LHtcIm9yZGluYWwtbnVtYmVyLXN1ZmZpeFwiOjJ9XSwyOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcblxuLyoqXG4gKiBHZXQgdGhlIG9yZGluYWwgbnVtYmVyIHdpdGggc3VmZml4IGZyb20gYG5gXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqIEBwYXJhbSB7TnVtYmVyfSBuXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChuKSB7XG4gIHJldHVybiBuICsgZXhwb3J0cy5zdWZmaXgoK24pO1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIHN1ZmZpeCBmb3IgdGhlIGdpdmVuIGBuYFxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IG5cbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZXhwb3J0cy5zdWZmaXggPSBmdW5jdGlvbiAobikge1xuICByZXR1cm4gTWF0aC5mbG9vcihuIC8gMTApID09PSAxXG4gICAgICA/ICd0aCdcbiAgICAgIDogKG4gJSAxMCA9PT0gMVxuICAgICAgICA/ICdzdCdcbiAgICAgICAgOiAobiAlIDEwID09PSAyXG4gICAgICAgICAgPyAnbmQnXG4gICAgICAgICAgOiAobiAlIDEwID09PSAzXG4gICAgICAgICAgICA/ICdyZCdcbiAgICAgICAgICAgIDogJ3RoJykpKTtcbn07XG5cbn0se31dfSx7fSxbMV0pO1xuIiwiKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgYW5ndWxhclxuICAgIC5tb2R1bGUoJ3R3ZWV0c3RvY2tyJylcbiAgICAuY29udHJvbGxlcignaG9tZUNvbnRyb2xsZXInLCBob21lQ29udHJvbGxlcik7XG5cbiAgZnVuY3Rpb24gaG9tZUNvbnRyb2xsZXIoJHNjb3BlLCBTb2NrZXQsIFBvcnRmb2xpbywgU2hhcmVzLCAkaW50ZXJ2YWwsICR0aW1lb3V0LCAkcm9vdFNjb3BlLCBOb3RpZmljYXRpb24sICR3aW5kb3cpIHtcbiAgICAkc2NvcGUucG9pbnRzID0gZmFsc2U7XG4gICAgJHNjb3BlLnZhcmlhdGlvbiA9IGZhbHNlO1xuXG4gICAgY29uc29sZS5sb2coJHJvb3RTY29wZS5jdXJyZW50VXNlcik7XG5cbiAgICAkc2NvcGUuZ2V0UG9ydGZvbGlvID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoJHNjb3BlLmN1cnJlbnRVc2VyKSB7XG4gICAgICAgIFBvcnRmb2xpby5xdWVyeShmdW5jdGlvbihzaGFyZXMpIHtcbiAgICAgICAgICAkc2NvcGUucG9ydGZvbGlvID0gc2hhcmVzO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgJHNjb3BlLmJ1eVNoYXJlID0gZnVuY3Rpb24oc3RvY2spIHtcbiAgICAgIGlmKCRyb290U2NvcGUuY3VycmVudFVzZXIgPT09IG51bGwpIHtcbiAgICAgICAgJHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9hdXRoL3R3aXR0ZXInO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHNoYXJlID0gbmV3IFNoYXJlcyh7XG4gICAgICAgICAgc3RvY2s6IHN0b2NrLm5hbWUsXG4gICAgICAgICAgYW1vdW50OiBzdG9jay5hbW91bnRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2hhcmUuJHNhdmUoZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgaWYgKHJlcy5zdWNjZXNzID09PSBmYWxzZSkge1xuICAgICAgICAgICAgTm90aWZpY2F0aW9uLmVycm9yKHJlcy5tZXNzYWdlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgTm90aWZpY2F0aW9uLnN1Y2Nlc3MoJ1lvdSBib3VnaHQgJyArIHJlcy5zdG9jayArICchJyk7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLmN1cnJlbnRVc2VyID0gcmVzLm93bmVyO1xuICAgICAgICAgICAgJHNjb3BlLmdldFBvcnRmb2xpbygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgICRzY29wZS5zZWxsU2hhcmUgPSBmdW5jdGlvbihzaGFyZUlkKSB7XG4gICAgICB2YXIgc2hhcmUgPSBTaGFyZXMuZ2V0KHtcbiAgICAgICAgc2hhcmVJZCA6IHNoYXJlSWRcbiAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICBzaGFyZS4kZGVsZXRlKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIE5vdGlmaWNhdGlvbi5zdWNjZXNzKCdZb3Ugc29sZCAnICsgcmVzLnN0b2NrICsgJyEnKTtcbiAgICAgICAgICAkcm9vdFNjb3BlLmN1cnJlbnRVc2VyID0gcmVzLm93bmVyO1xuICAgICAgICAgICRzY29wZS5nZXRQb3J0Zm9saW8oKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLmdldFN0b2NrcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgU29ja2V0LmVtaXQoJ3VwZGF0ZS1tZScpO1xuICAgICAgJHNjb3BlLmdldFBvcnRmb2xpbygpO1xuICAgIH07XG5cbiAgICAkc2NvcGUuY2hhcnRPcHRpb25zID0ge1xuICAgICAgc2VyaWVzQmFyRGlzdGFuY2U6IDE1LFxuICAgICAgc2hvd0FyZWE6IHRydWVcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZ2V0UmFuZG9tSW50KG1pbiwgbWF4KSB7XG4gICAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikpICsgbWluO1xuICAgIH1cblxuICAgIC8vIFVwZGF0ZSBkYXRhXG5cbiAgICBTb2NrZXQub24oJ3R3ZWV0JywgZnVuY3Rpb24oZGF0YSl7XG5cbiAgICAgICRzY29wZS50d2VldCA9IGRhdGE7XG5cbiAgICB9KTtcblxuICAgIFNvY2tldC5vbignY3VycmVudENvdW50JywgZnVuY3Rpb24oZGF0YSl7XG5cbiAgICAgICRzY29wZS5jdXJyZW50Q291bnQgPSBkYXRhO1xuXG4gICAgfSk7XG5cbiAgICBTb2NrZXQub24oJ3VwZGF0ZScsIGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgICAgJHNjb3BlLnN0b2NrcyA9IGRhdGE7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgJHNjb3BlLnN0b2Nrcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgc3RvY2sgPSAkc2NvcGUuc3RvY2tzW2ldO1xuICAgICAgICB2YXIgZGF0YUxlbmdodCA9IHN0b2NrLmhpc3RvcnkubGVuZ3RoO1xuXG4gICAgICAgIC8vIEdldCB2YXJpYXRpb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICBpZiAoc3RvY2suY291bnQgPiAwICYmIGRhdGFMZW5naHQgPiAxKXtcbiAgICAgICAgICBpZiAoc3RvY2suaGlzdG9yeVsxXS5jb3VudCA+IDApe1xuICAgICAgICAgICAgLy8gKCAoY3VycmVudFByaWNlL2xhc3RQcmljZSktMSApICogMTAwXG4gICAgICAgICAgICB2YXIgdmFyaWF0aW9uTnVtYmVyID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgKCggc3RvY2suY291bnQgLyBzdG9jay5oaXN0b3J5WzFdLmNvdW50ICkgLSAxKSAqIDEwMDtcbiAgICAgICAgICAgIHN0b2NrLnZhcmlhdGlvbiA9IE1hdGgucm91bmQodmFyaWF0aW9uTnVtYmVyKS50b0ZpeGVkKDApICsgJyUnO1xuICAgICAgICAgICAgc3RvY2subGFzdE1vdmUgPSAodmFyaWF0aW9uTnVtYmVyIDwgMCkgPyAnZGFuZ2VyJyA6ICdzdWNjZXNzJztcbiAgICAgICAgICAgIHN0b2NrLmljb24gPSAodmFyaWF0aW9uTnVtYmVyIDwgMCkgPyAnZmEtY2FyZXQtZG93bicgOiAnZmEtY2FyZXQtdXAnO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgICAgICAvLyBQcmVwYXJlIGNoYXJ0IGRhdGEgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgdmFyIGNoYXJ0RGF0YSA9IHt9O1xuXG4gICAgICAgIGNoYXJ0RGF0YS5sYWJlbHMgPSBbXTtcbiAgICAgICAgY2hhcnREYXRhLnNlcmllcyA9IFtbXV07XG5cbiAgICAgICAgZm9yICh2YXIgaTIgPSBkYXRhTGVuZ2h0LTE7IGkyID49IDA7IGkyLS0pe1xuICAgICAgICAgIHZhciBkID0gbmV3IERhdGUoc3RvY2suaGlzdG9yeVtpMl0uY3JlYXRlZCk7XG4gICAgICAgICAgdmFyIGxhYmVsID0gZC5nZXRIb3VycygpICsgJzonICsgZC5nZXRNaW51dGVzKCk7XG5cbiAgICAgICAgICBjaGFydERhdGEuc2VyaWVzWzBdLnB1c2goc3RvY2suaGlzdG9yeVtpMl0uY291bnQpO1xuICAgICAgICAgIGNoYXJ0RGF0YS5sYWJlbHMucHVzaChsYWJlbCk7XG4gICAgICAgIH1cblxuICAgICAgICBzdG9jay5jaGFydERhdGEgPSBjaGFydERhdGE7XG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgfVxuXG4gICAgICAkc2NvcGUucmVzcG9uc2VSZWNlaXZlZCA9IHRydWU7XG4gICAgICAkc2NvcGUuZ2V0UG9ydGZvbGlvKCk7XG4gICAgfSk7XG5cbiAgICBTb2NrZXQub24oJ3VwZGF0ZS1kYXRlJywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgJHNjb3BlLnN0b2Nrc1VwZGF0ZWRBdCA9IG5ldyBEYXRlKGRhdGEpO1xuICAgIH0pO1xuICB9XG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgYW5ndWxhclxuICAgIC5tb2R1bGUoJ3R3ZWV0c3RvY2tyJylcbiAgICAuY29udHJvbGxlcignbG9nb3V0Q29udHJvbGxlcicsIGxvZ291dENvbnRyb2xsZXIpO1xuXG4gIGZ1bmN0aW9uIGxvZ291dENvbnRyb2xsZXIoQXV0aCwgJHdpbmRvdykge1xuXG4gICAgQXV0aC5sb2dvdXQoZnVuY3Rpb24oZXJyKSB7XG4gICAgICBpZighZXJyKSB7XG4gICAgICAgICR3aW5kb3cubG9jYXRpb24uaHJlZiA9ICdodHRwOi8vJyArICR3aW5kb3cubG9jYXRpb24uaG9zdCArICcvbG9nb3V0JztcbiAgICAgIH1cbiAgICB9KTtcblxuICB9XG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgYW5ndWxhclxuICAgIC5tb2R1bGUoJ3R3ZWV0c3RvY2tyJylcbiAgICAuY29udHJvbGxlcigncHJvZmlsZUNvbnRyb2xsZXInLCBwcm9maWxlQ29udHJvbGxlcik7XG5cbiAgZnVuY3Rpb24gcHJvZmlsZUNvbnRyb2xsZXIoJGxvY2F0aW9uLCBSZXNldEFjY291bnQsICR3aW5kb3csICRyb290U2NvcGUpIHtcbiAgICB2YXIgdm0gPSB0aGlzO1xuXG4gICAgLy8gU2V0dGluZyBuYW1lL3VzZXJuYW1lIHRvIG5hbWUvdXNlcm5hbWUgZmllbGQgb24gdmlldy5cbiAgICB2bS5uYW1lID0gJHJvb3RTY29wZS5jdXJyZW50VXNlci5uYW1lXG4gICAgdm0udXNlcm5hbWUgPSAkcm9vdFNjb3BlLmN1cnJlbnRVc2VyLnVzZXJuYW1lXG5cbiAgICB2bS5yZXNldEFjY291bnQgPSBmdW5jdGlvbigpIHtcbiAgICAgIFJlc2V0QWNjb3VudC5zYXZlKFxuICAgICAgICBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICAkd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnaHR0cDovLycgKyAkd2luZG93LmxvY2F0aW9uLmhvc3Q7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICB2bS5vcGVuTW9kYWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2bS5jb25maXJtTW9kYWwgPSB0cnVlO1xuICAgIH1cblxuICAgIHZtLmNsb3NlTW9kYWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2bS5jb25maXJtTW9kYWwgPSBmYWxzZTtcbiAgICB9XG4gIH1cbn0pKCk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBhbmd1bGFyXG4gICAgLm1vZHVsZSgndHdlZXRzdG9ja3InKVxuICAgIC5jb250cm9sbGVyKCdyYW5raW5nQ29udHJvbGxlcicsIHJhbmtpbmdDb250cm9sbGVyKTtcblxuICBmdW5jdGlvbiByYW5raW5nQ29udHJvbGxlcihSYW5raW5nKSB7XG4gICAgdmFyIHZtID0gdGhpcztcblxuICAgIHZtLmZpbmQgPSBmdW5jdGlvbigpIHtcbiAgICAgIFJhbmtpbmcucXVlcnkoZnVuY3Rpb24ocmFua2luZykge1xuICAgICAgICB2bS51c2VycyA9IHJhbmtpbmc7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgdm0uZmluZCgpO1xuICB9XG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgYW5ndWxhclxuICAgIC5tb2R1bGUoJ3R3ZWV0c3RvY2tyJylcbiAgICAuZGlyZWN0aXZlKCduYXZiYXInLCBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ3NoYXJlZC9uYXZiYXInXG4gICAgICB9O1xuICAgIH0pO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBhbmd1bGFyXG4gICAgLm1vZHVsZSgndHdlZXRzdG9ja3InKVxuICAgIC5mYWN0b3J5KCdBdXRoJywgQXV0aCk7XG5cbiAgZnVuY3Rpb24gQXV0aCgkcm9vdFNjb3BlLCAkY29va2llcywgJHJlc291cmNlKSB7XG4gICAgJHJvb3RTY29wZS5jdXJyZW50VXNlciA9IGFuZ3VsYXIuZnJvbUpzb24oJGNvb2tpZXMuZ2V0KCd1c2VyJykpIHx8IG51bGw7XG4gICAgJGNvb2tpZXMucmVtb3ZlKCd1c2VyJyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgY3VycmVudFVzZXI6IGZ1bmN0aW9uKCkge30sXG4gICAgICBsb2dvdXQ6IGZ1bmN0aW9uKGNiKXtcbiAgICAgICAgJHJvb3RTY29wZS5jdXJyZW50VXNlciA9IG51bGw7XG4gICAgICAgICRjb29raWVzLnJlbW92ZSgndXNlcicpO1xuICAgICAgICBjYigpO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn0pKCk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBhbmd1bGFyXG4gICAgLm1vZHVsZSgndHdlZXRzdG9ja3InKVxuICAgIC5mYWN0b3J5KCdQb3J0Zm9saW8nLCBQb3J0Zm9saW8pO1xuXG4gIGZ1bmN0aW9uIFBvcnRmb2xpbygkcmVzb3VyY2UpIHtcbiAgICByZXR1cm4gJHJlc291cmNlKCdhcGkvcG9ydGZvbGlvLycpO1xuICB9XG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgYW5ndWxhclxuICAgIC5tb2R1bGUoJ3R3ZWV0c3RvY2tyJylcbiAgICAuZmFjdG9yeSgnUmFua2luZycsIFJhbmtpbmcpO1xuXG4gIGZ1bmN0aW9uIFJhbmtpbmcoJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZSgnYXBpL3JhbmtpbmcvJyk7XG4gIH1cbn0pKCk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBhbmd1bGFyXG4gICAgLm1vZHVsZSgndHdlZXRzdG9ja3InKVxuICAgIC5mYWN0b3J5KCdSZXNldEFjY291bnQnLCBSZXNldEFjY291bnQpO1xuXG4gIGZ1bmN0aW9uIFJlc2V0QWNjb3VudCgkcmVzb3VyY2UpIHtcbiAgICByZXR1cm4gJHJlc291cmNlKCcvYXV0aC9yZXNldC86dXNlcklkJyk7XG4gIH1cbn0pKCk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBob3cgaXQgd29ya3MgaGVyZTpcbiAgLy8gaHR0cDovL3d3dy5zaXRlcG9pbnQuY29tL2NyZWF0aW5nLWNydWQtYXBwLW1pbnV0ZXMtYW5ndWxhcnMtcmVzb3VyY2UvXG5cbiAgYW5ndWxhclxuICAgIC5tb2R1bGUoJ3R3ZWV0c3RvY2tyJylcbiAgICAuZmFjdG9yeSgnU2hhcmVzJywgU2hhcmVzKTtcblxuICBmdW5jdGlvbiBTaGFyZXMoJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZSgnYXBpL3NoYXJlcy86c2hhcmVJZCcsIHtcbiAgICAgIHNoYXJlSWQ6ICdAX2lkJ1xuICAgIH0sIHtcbiAgICAgIHVwZGF0ZToge1xuICAgICAgICBtZXRob2Q6ICdQVVQnXG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn0pKCk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBhbmd1bGFyXG4gICAgLm1vZHVsZSgndHdlZXRzdG9ja3InKVxuICAgIC5mYWN0b3J5KCdTb2NrZXQnLCBTb2NrZXQpO1xuXG4gIGZ1bmN0aW9uIFNvY2tldCgkcm9vdFNjb3BlKSB7XG4gICAgdmFyIHNvY2tldCA9IGlvLmNvbm5lY3QoKTtcblxuICAgIHJldHVybiB7XG4gICAgICBvbjogZnVuY3Rpb24gKGV2ZW50TmFtZSwgY2FsbGJhY2spIHtcbiAgICAgICAgZnVuY3Rpb24gd3JhcHBlcigpIHtcbiAgICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAkcm9vdFNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjYWxsYmFjay5hcHBseShzb2NrZXQsIGFyZ3MpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgc29ja2V0Lm9uKGV2ZW50TmFtZSwgd3JhcHBlcik7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBzb2NrZXQucmVtb3ZlTGlzdGVuZXIoZXZlbnROYW1lLCB3cmFwcGVyKTtcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgICBlbWl0OiBmdW5jdGlvbiAoZXZlbnROYW1lLCBkYXRhLCBjYWxsYmFjaykge1xuICAgICAgICBzb2NrZXQuZW1pdChldmVudE5hbWUsIGRhdGEsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAkcm9vdFNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZihjYWxsYmFjaykge1xuICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShzb2NrZXQsIGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgYW5ndWxhclxuICAgIC5tb2R1bGUoJ3R3ZWV0c3RvY2tyJylcbiAgICAuZmFjdG9yeSgnVXNlcicsIFVzZXIpO1xuXG4gIGZ1bmN0aW9uIFVzZXIoJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZSgnL2F1dGgvdXNlci86aWQvJywge30sXG4gICAge1xuICAgICAgJ3VwZGF0ZSc6IHtcbiAgICAgICAgbWV0aG9kOidQVVQnXG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn0pKCk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
