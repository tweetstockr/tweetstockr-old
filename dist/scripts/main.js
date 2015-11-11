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
    .controller('profileController', profileController);

  function profileController(Auth, $location, ResetAccount, $window, $rootScope) {
    var vm = this;

    // Setting name/username to name/username field on view.
    vm.name = $rootScope.currentUser.name
    vm.username = $rootScope.currentUser.username

    vm.logout = function() {
      Auth.logout(function(err) {
        if(!err) {
          $location.path('/');
        }
      });
    };

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
    // var socket = io.connect('http://localhost:3000');
    var socket = io.connect('http://www.tweetstockr.com');

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsIm9yZGluYWwuanMiLCJob21lQ29udHJvbGxlci5qcyIsInByb2ZpbGVDb250cm9sbGVyLmpzIiwicmFua2luZ0NvbnRyb2xsZXIuanMiLCJuYXZiYXIuanMiLCJBdXRoLmpzIiwiUG9ydGZvbGlvLmpzIiwiUmFua2luZy5qcyIsIlJlc2V0QWNjb3VudC5qcyIsIlNoYXJlcy5qcyIsIlNvY2tldC5qcyIsIlVzZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBhbmd1bGFyXG4gICAgLm1vZHVsZSgndHdlZXRzdG9ja3InLCBbXG4gICAgICAnbmdSZXNvdXJjZScsXG4gICAgICAnbmdSb3V0ZScsXG4gICAgICAnbmdDb29raWVzJyxcbiAgICAgICdhbmd1bGFyLWNoYXJ0aXN0JyxcbiAgICAgICd1aS1ub3RpZmljYXRpb24nXG4gICAgXSlcbiAgICAuY29uZmlnKGZ1bmN0aW9uKCRyb3V0ZVByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlciwgTm90aWZpY2F0aW9uUHJvdmlkZXIpIHtcbiAgICAgICRyb3V0ZVByb3ZpZGVyXG4gICAgICAud2hlbignL2hvbWUnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAncGFydGlhbHMvaG9tZScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdob21lQ29udHJvbGxlcidcbiAgICAgIH0pXG5cbiAgICAgIC53aGVuKCcvcHJvZmlsZScsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdwYXJ0aWFscy9wcm9maWxlJyxcbiAgICAgICAgY29udHJvbGxlcjogJ3Byb2ZpbGVDb250cm9sbGVyJyxcbiAgICAgICAgY29udHJvbGxlckFzOiAncHJvZmlsZSdcbiAgICAgIH0pXG5cbiAgICAgIC53aGVuKCcvcmFua2luZycsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdwYXJ0aWFscy9yYW5raW5nJyxcbiAgICAgICAgY29udHJvbGxlcjogJ3JhbmtpbmdDb250cm9sbGVyJyxcbiAgICAgICAgY29udHJvbGxlckFzOiAncmFua2luZydcbiAgICAgIH0pXG5cbiAgICAgIC5vdGhlcndpc2Uoe1xuICAgICAgICByZWRpcmVjdFRvOiAnL2hvbWUnXG4gICAgICB9KTtcblxuICAgICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xuXG4gICAgICBOb3RpZmljYXRpb25Qcm92aWRlci5zZXRPcHRpb25zKHtcbiAgICAgICAgZGVsYXk6IDUwMDAsXG4gICAgICAgIHN0YXJ0VG9wOiAyMCxcbiAgICAgICAgc3RhcnRSaWdodDogMjAsXG4gICAgICAgIHZlcnRpY2FsU3BhY2luZzogMjAsXG4gICAgICAgIGhvcml6b250YWxTcGFjaW5nOiAyMCxcbiAgICAgICAgcG9zaXRpb25YOiAncmlnaHQnLFxuICAgICAgICBwb3NpdGlvblk6ICd0b3AnXG4gICAgICB9KTtcbiAgICB9KVxuXG4gICAgLnJ1bihmdW5jdGlvbiAoJHJvb3RTY29wZSwgJGxvY2F0aW9uLCBBdXRoKSB7XG4gICAgICAvL3dhdGNoaW5nIHRoZSB2YWx1ZSBvZiB0aGUgY3VycmVudFVzZXIgdmFyaWFibGUuXG4gICAgICAkcm9vdFNjb3BlLiR3YXRjaCgnY3VycmVudFVzZXInLCBmdW5jdGlvbihjdXJyZW50VXNlcikge1xuICAgICAgICBBdXRoLmN1cnJlbnRVc2VyKCk7XG4gICAgICB9KTtcbiAgICB9KTtcbn0pKCk7XG4iLCIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSh7MTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBvcmRpbmFsID0gcmVxdWlyZSgnb3JkaW5hbC1udW1iZXItc3VmZml4Jyk7XG5cbmFuZ3VsYXJcbiAgLm1vZHVsZSgndHdlZXRzdG9ja3InKVxuXG4gIC8vIFRha2UgYSBudW1iZXIgYW5kIHJldHVybnMgaXRzIG9yZGluYWwgdmFsdWVcbiAgLy8gaS5lLiAxIC0+IDFzdCwgMiAtPiAybmQsIGV0Yy5cbiAgLmZpbHRlcignb3JkaW5hbCcsIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgdmFyIG51bSA9IHBhcnNlSW50KGlucHV0LCAxMCk7XG4gICAgICByZXR1cm4gaXNOYU4obnVtKSA/IGlucHV0IDogb3JkaW5hbChudW0pO1xuICAgIH07XG4gIH0pO1xuXG59LHtcIm9yZGluYWwtbnVtYmVyLXN1ZmZpeFwiOjJ9XSwyOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcblxuLyoqXG4gKiBHZXQgdGhlIG9yZGluYWwgbnVtYmVyIHdpdGggc3VmZml4IGZyb20gYG5gXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqIEBwYXJhbSB7TnVtYmVyfSBuXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChuKSB7XG4gIHJldHVybiBuICsgZXhwb3J0cy5zdWZmaXgoK24pO1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIHN1ZmZpeCBmb3IgdGhlIGdpdmVuIGBuYFxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IG5cbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZXhwb3J0cy5zdWZmaXggPSBmdW5jdGlvbiAobikge1xuICByZXR1cm4gTWF0aC5mbG9vcihuIC8gMTApID09PSAxXG4gICAgICA/ICd0aCdcbiAgICAgIDogKG4gJSAxMCA9PT0gMVxuICAgICAgICA/ICdzdCdcbiAgICAgICAgOiAobiAlIDEwID09PSAyXG4gICAgICAgICAgPyAnbmQnXG4gICAgICAgICAgOiAobiAlIDEwID09PSAzXG4gICAgICAgICAgICA/ICdyZCdcbiAgICAgICAgICAgIDogJ3RoJykpKTtcbn07XG5cbn0se31dfSx7fSxbMV0pO1xuIiwiKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgYW5ndWxhclxuICAgIC5tb2R1bGUoJ3R3ZWV0c3RvY2tyJylcbiAgICAuY29udHJvbGxlcignaG9tZUNvbnRyb2xsZXInLCBob21lQ29udHJvbGxlcik7XG5cbiAgZnVuY3Rpb24gaG9tZUNvbnRyb2xsZXIoJHNjb3BlLCBTb2NrZXQsIFBvcnRmb2xpbywgU2hhcmVzLCAkaW50ZXJ2YWwsICR0aW1lb3V0LCAkcm9vdFNjb3BlLCBOb3RpZmljYXRpb24sICR3aW5kb3cpIHtcbiAgICAkc2NvcGUucG9pbnRzID0gZmFsc2U7XG4gICAgJHNjb3BlLnZhcmlhdGlvbiA9IGZhbHNlO1xuXG4gICAgY29uc29sZS5sb2coJHJvb3RTY29wZS5jdXJyZW50VXNlcik7XG5cbiAgICAkc2NvcGUuZ2V0UG9ydGZvbGlvID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoJHNjb3BlLmN1cnJlbnRVc2VyKSB7XG4gICAgICAgIFBvcnRmb2xpby5xdWVyeShmdW5jdGlvbihzaGFyZXMpIHtcbiAgICAgICAgICAkc2NvcGUucG9ydGZvbGlvID0gc2hhcmVzO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgJHNjb3BlLmJ1eVNoYXJlID0gZnVuY3Rpb24oc3RvY2spIHtcbiAgICAgIGlmKCRyb290U2NvcGUuY3VycmVudFVzZXIgPT09IG51bGwpIHtcbiAgICAgICAgJHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9hdXRoL3R3aXR0ZXInO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHNoYXJlID0gbmV3IFNoYXJlcyh7XG4gICAgICAgICAgc3RvY2s6IHN0b2NrLm5hbWUsXG4gICAgICAgICAgYW1vdW50OiBzdG9jay5hbW91bnRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2hhcmUuJHNhdmUoZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgaWYgKHJlcy5zdWNjZXNzID09PSBmYWxzZSkge1xuICAgICAgICAgICAgTm90aWZpY2F0aW9uLmVycm9yKHJlcy5tZXNzYWdlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgTm90aWZpY2F0aW9uLnN1Y2Nlc3MoJ1lvdSBib3VnaHQgJyArIHJlcy5zdG9jayArICchJyk7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLmN1cnJlbnRVc2VyID0gcmVzLm93bmVyO1xuICAgICAgICAgICAgJHNjb3BlLmdldFBvcnRmb2xpbygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgICRzY29wZS5zZWxsU2hhcmUgPSBmdW5jdGlvbihzaGFyZUlkKSB7XG4gICAgICB2YXIgc2hhcmUgPSBTaGFyZXMuZ2V0KHtcbiAgICAgICAgc2hhcmVJZCA6IHNoYXJlSWRcbiAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICBzaGFyZS4kZGVsZXRlKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIE5vdGlmaWNhdGlvbi5zdWNjZXNzKCdZb3Ugc29sZCAnICsgcmVzLnN0b2NrICsgJyEnKTtcbiAgICAgICAgICAkcm9vdFNjb3BlLmN1cnJlbnRVc2VyID0gcmVzLm93bmVyO1xuICAgICAgICAgICRzY29wZS5nZXRQb3J0Zm9saW8oKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLmdldFN0b2NrcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgU29ja2V0LmVtaXQoJ3VwZGF0ZS1tZScpO1xuICAgICAgJHNjb3BlLmdldFBvcnRmb2xpbygpO1xuICAgIH07XG5cbiAgICAkc2NvcGUuY2hhcnRPcHRpb25zID0ge1xuICAgICAgc2VyaWVzQmFyRGlzdGFuY2U6IDE1LFxuICAgICAgc2hvd0FyZWE6IHRydWVcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZ2V0UmFuZG9tSW50KG1pbiwgbWF4KSB7XG4gICAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikpICsgbWluO1xuICAgIH1cblxuICAgIC8vIFVwZGF0ZSBkYXRhXG4gICAgXG4gICAgU29ja2V0Lm9uKCd1cGRhdGUnLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAkc2NvcGUuc3RvY2tzID0gZGF0YTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAkc2NvcGUuc3RvY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBzdG9jayA9ICRzY29wZS5zdG9ja3NbaV07XG4gICAgICAgIHZhciBkYXRhTGVuZ2h0ID0gc3RvY2suaGlzdG9yeS5sZW5ndGg7XG5cbiAgICAgICAgLy8gR2V0IHZhcmlhdGlvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIGlmIChzdG9jay5jb3VudCA+IDAgJiYgZGF0YUxlbmdodCA+IDEpe1xuICAgICAgICAgIGlmIChzdG9jay5oaXN0b3J5WzFdLmNvdW50ID4gMCl7XG4gICAgICAgICAgICAvLyAoIChjdXJyZW50UHJpY2UvbGFzdFByaWNlKS0xICkgKiAxMDBcbiAgICAgICAgICAgIHZhciB2YXJpYXRpb25OdW1iZXIgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAoKCBzdG9jay5jb3VudCAvIHN0b2NrLmhpc3RvcnlbMV0uY291bnQgKSAtIDEpICogMTAwO1xuICAgICAgICAgICAgc3RvY2sudmFyaWF0aW9uID0gTWF0aC5yb3VuZCh2YXJpYXRpb25OdW1iZXIpLnRvRml4ZWQoMCkgKyAnJSc7XG4gICAgICAgICAgICBzdG9jay5sYXN0TW92ZSA9ICh2YXJpYXRpb25OdW1iZXIgPCAwKSA/ICdkYW5nZXInIDogJ3N1Y2Nlc3MnO1xuICAgICAgICAgICAgc3RvY2suaWNvbiA9ICh2YXJpYXRpb25OdW1iZXIgPCAwKSA/ICdmYS1jYXJldC1kb3duJyA6ICdmYS1jYXJldC11cCc7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgICAgIC8vIFByZXBhcmUgY2hhcnQgZGF0YSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICB2YXIgY2hhcnREYXRhID0ge307XG5cbiAgICAgICAgY2hhcnREYXRhLmxhYmVscyA9IFtdO1xuICAgICAgICBjaGFydERhdGEuc2VyaWVzID0gW1tdXTtcblxuICAgICAgICBmb3IgKHZhciBpMiA9IGRhdGFMZW5naHQtMTsgaTIgPj0gMDsgaTItLSl7XG4gICAgICAgICAgdmFyIGQgPSBuZXcgRGF0ZShzdG9jay5oaXN0b3J5W2kyXS5jcmVhdGVkKTtcbiAgICAgICAgICB2YXIgbGFiZWwgPSBkLmdldEhvdXJzKCkgKyAnOicgKyBkLmdldE1pbnV0ZXMoKTtcblxuICAgICAgICAgIGNoYXJ0RGF0YS5zZXJpZXNbMF0ucHVzaChzdG9jay5oaXN0b3J5W2kyXS5jb3VudCk7XG4gICAgICAgICAgY2hhcnREYXRhLmxhYmVscy5wdXNoKGxhYmVsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0b2NrLmNoYXJ0RGF0YSA9IGNoYXJ0RGF0YTtcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICB9XG5cbiAgICAgICRzY29wZS5yZXNwb25zZVJlY2VpdmVkID0gdHJ1ZTtcbiAgICAgICRzY29wZS5nZXRQb3J0Zm9saW8oKTtcbiAgICB9KTtcblxuICAgIFNvY2tldC5vbigndXBkYXRlLWRhdGUnLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAkc2NvcGUuc3RvY2tzVXBkYXRlZEF0ID0gbmV3IERhdGUoZGF0YSk7XG4gICAgfSk7XG4gIH1cbn0pKCk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBhbmd1bGFyXG4gICAgLm1vZHVsZSgndHdlZXRzdG9ja3InKVxuICAgIC5jb250cm9sbGVyKCdwcm9maWxlQ29udHJvbGxlcicsIHByb2ZpbGVDb250cm9sbGVyKTtcblxuICBmdW5jdGlvbiBwcm9maWxlQ29udHJvbGxlcihBdXRoLCAkbG9jYXRpb24sIFJlc2V0QWNjb3VudCwgJHdpbmRvdywgJHJvb3RTY29wZSkge1xuICAgIHZhciB2bSA9IHRoaXM7XG5cbiAgICAvLyBTZXR0aW5nIG5hbWUvdXNlcm5hbWUgdG8gbmFtZS91c2VybmFtZSBmaWVsZCBvbiB2aWV3LlxuICAgIHZtLm5hbWUgPSAkcm9vdFNjb3BlLmN1cnJlbnRVc2VyLm5hbWVcbiAgICB2bS51c2VybmFtZSA9ICRyb290U2NvcGUuY3VycmVudFVzZXIudXNlcm5hbWVcblxuICAgIHZtLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgQXV0aC5sb2dvdXQoZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGlmKCFlcnIpIHtcbiAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnLycpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgdm0ucmVzZXRBY2NvdW50ID0gZnVuY3Rpb24oKSB7XG4gICAgICBSZXNldEFjY291bnQuc2F2ZShcbiAgICAgICAgZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgJHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJ2h0dHA6Ly8nICsgJHdpbmRvdy5sb2NhdGlvbi5ob3N0O1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgdm0ub3Blbk1vZGFsID0gZnVuY3Rpb24gKCkge1xuICAgICAgdm0uY29uZmlybU1vZGFsID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB2bS5jbG9zZU1vZGFsID0gZnVuY3Rpb24gKCkge1xuICAgICAgdm0uY29uZmlybU1vZGFsID0gZmFsc2U7XG4gICAgfVxuICB9XG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgYW5ndWxhclxuICAgIC5tb2R1bGUoJ3R3ZWV0c3RvY2tyJylcbiAgICAuY29udHJvbGxlcigncmFua2luZ0NvbnRyb2xsZXInLCByYW5raW5nQ29udHJvbGxlcik7XG5cbiAgZnVuY3Rpb24gcmFua2luZ0NvbnRyb2xsZXIoUmFua2luZykge1xuICAgIHZhciB2bSA9IHRoaXM7XG5cbiAgICB2bS5maW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICBSYW5raW5nLnF1ZXJ5KGZ1bmN0aW9uKHJhbmtpbmcpIHtcbiAgICAgICAgdm0udXNlcnMgPSByYW5raW5nO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHZtLmZpbmQoKTtcbiAgfVxufSkoKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGFuZ3VsYXJcbiAgICAubW9kdWxlKCd0d2VldHN0b2NrcicpXG4gICAgLmRpcmVjdGl2ZSgnbmF2YmFyJywgZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdzaGFyZWQvbmF2YmFyJ1xuICAgICAgfTtcbiAgICB9KTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgYW5ndWxhclxuICAgIC5tb2R1bGUoJ3R3ZWV0c3RvY2tyJylcbiAgICAuZmFjdG9yeSgnQXV0aCcsIEF1dGgpO1xuXG4gIGZ1bmN0aW9uIEF1dGgoJHJvb3RTY29wZSwgJGNvb2tpZXMsICRyZXNvdXJjZSkge1xuICAgICRyb290U2NvcGUuY3VycmVudFVzZXIgPSBhbmd1bGFyLmZyb21Kc29uKCRjb29raWVzLmdldCgndXNlcicpKSB8fCBudWxsO1xuICAgICRjb29raWVzLnJlbW92ZSgndXNlcicpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGN1cnJlbnRVc2VyOiBmdW5jdGlvbigpIHt9LFxuXG4gICAgfTtcbiAgfVxufSkoKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGFuZ3VsYXJcbiAgICAubW9kdWxlKCd0d2VldHN0b2NrcicpXG4gICAgLmZhY3RvcnkoJ1BvcnRmb2xpbycsIFBvcnRmb2xpbyk7XG5cbiAgZnVuY3Rpb24gUG9ydGZvbGlvKCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoJ2FwaS9wb3J0Zm9saW8vJyk7XG4gIH1cbn0pKCk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBhbmd1bGFyXG4gICAgLm1vZHVsZSgndHdlZXRzdG9ja3InKVxuICAgIC5mYWN0b3J5KCdSYW5raW5nJywgUmFua2luZyk7XG5cbiAgZnVuY3Rpb24gUmFua2luZygkcmVzb3VyY2UpIHtcbiAgICByZXR1cm4gJHJlc291cmNlKCdhcGkvcmFua2luZy8nKTtcbiAgfVxufSkoKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGFuZ3VsYXJcbiAgICAubW9kdWxlKCd0d2VldHN0b2NrcicpXG4gICAgLmZhY3RvcnkoJ1Jlc2V0QWNjb3VudCcsIFJlc2V0QWNjb3VudCk7XG5cbiAgZnVuY3Rpb24gUmVzZXRBY2NvdW50KCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoJy9hdXRoL3Jlc2V0Lzp1c2VySWQnKTtcbiAgfVxufSkoKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIGhvdyBpdCB3b3JrcyBoZXJlOlxuICAvLyBodHRwOi8vd3d3LnNpdGVwb2ludC5jb20vY3JlYXRpbmctY3J1ZC1hcHAtbWludXRlcy1hbmd1bGFycy1yZXNvdXJjZS9cblxuICBhbmd1bGFyXG4gICAgLm1vZHVsZSgndHdlZXRzdG9ja3InKVxuICAgIC5mYWN0b3J5KCdTaGFyZXMnLCBTaGFyZXMpO1xuXG4gIGZ1bmN0aW9uIFNoYXJlcygkcmVzb3VyY2UpIHtcbiAgICByZXR1cm4gJHJlc291cmNlKCdhcGkvc2hhcmVzLzpzaGFyZUlkJywge1xuICAgICAgc2hhcmVJZDogJ0BfaWQnXG4gICAgfSwge1xuICAgICAgdXBkYXRlOiB7XG4gICAgICAgIG1ldGhvZDogJ1BVVCdcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufSkoKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGFuZ3VsYXJcbiAgICAubW9kdWxlKCd0d2VldHN0b2NrcicpXG4gICAgLmZhY3RvcnkoJ1NvY2tldCcsIFNvY2tldCk7XG5cbiAgZnVuY3Rpb24gU29ja2V0KCRyb290U2NvcGUpIHtcbiAgICAvLyB2YXIgc29ja2V0ID0gaW8uY29ubmVjdCgnaHR0cDovL2xvY2FsaG9zdDozMDAwJyk7XG4gICAgdmFyIHNvY2tldCA9IGlvLmNvbm5lY3QoJ2h0dHA6Ly93d3cudHdlZXRzdG9ja3IuY29tJyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgb246IGZ1bmN0aW9uIChldmVudE5hbWUsIGNhbGxiYWNrKSB7XG4gICAgICAgIGZ1bmN0aW9uIHdyYXBwZXIoKSB7XG4gICAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgICAgJHJvb3RTY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkoc29ja2V0LCBhcmdzKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNvY2tldC5vbihldmVudE5hbWUsIHdyYXBwZXIpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgc29ja2V0LnJlbW92ZUxpc3RlbmVyKGV2ZW50TmFtZSwgd3JhcHBlcik7XG4gICAgICAgIH07XG4gICAgICB9LFxuICAgICAgZW1pdDogZnVuY3Rpb24gKGV2ZW50TmFtZSwgZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgICAgc29ja2V0LmVtaXQoZXZlbnROYW1lLCBkYXRhLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgICAgJHJvb3RTY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkoc29ja2V0LCBhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufSkoKTtcblxuIiwiKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgYW5ndWxhclxuICAgIC5tb2R1bGUoJ3R3ZWV0c3RvY2tyJylcbiAgICAuZmFjdG9yeSgnVXNlcicsIFVzZXIpO1xuXG4gIGZ1bmN0aW9uIFVzZXIoJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZSgnL2F1dGgvdXNlci86aWQvJywge30sXG4gICAge1xuICAgICAgJ3VwZGF0ZSc6IHtcbiAgICAgICAgbWV0aG9kOidQVVQnXG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn0pKCk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
