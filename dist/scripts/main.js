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

  function homeController($scope, Socket, Portfolio, Shares, $interval, $timeout, $rootScope, Notification) {
    $scope.points = false;
    $scope.variation = false;

    $scope.showPoints = function() {
      $scope.points = false;
      $scope.variation = false;

      $timeout(function() {
        $scope.showVariations();
      }, 5000);
    }

    $scope.showVariations = function() {
      $scope.points = true;
      $scope.variation = true;

      $timeout(function() {
        $scope.showPoints();
      }, 5000);
    }

    $scope.showPoints();

    $scope.getPortfolio = function() {
      if ($scope.currentUser) {
        Portfolio.query(function(shares) {
          $scope.portfolio = shares;
        });
      }
    };

    $scope.buyShare = function(stock) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsIm9yZGluYWwuanMiLCJob21lQ29udHJvbGxlci5qcyIsInByb2ZpbGVDb250cm9sbGVyLmpzIiwicmFua2luZ0NvbnRyb2xsZXIuanMiLCJuYXZiYXIuanMiLCJBdXRoLmpzIiwiUG9ydGZvbGlvLmpzIiwiUmFua2luZy5qcyIsIlJlc2V0QWNjb3VudC5qcyIsIlNoYXJlcy5qcyIsIlNvY2tldC5qcyIsIlVzZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgYW5ndWxhclxuICAgIC5tb2R1bGUoJ3R3ZWV0c3RvY2tyJywgW1xuICAgICAgJ25nUmVzb3VyY2UnLFxuICAgICAgJ25nUm91dGUnLFxuICAgICAgJ25nQ29va2llcycsXG4gICAgICAnYW5ndWxhci1jaGFydGlzdCcsXG4gICAgICAndWktbm90aWZpY2F0aW9uJ1xuICAgIF0pXG4gICAgLmNvbmZpZyhmdW5jdGlvbigkcm91dGVQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIsIE5vdGlmaWNhdGlvblByb3ZpZGVyKSB7XG4gICAgICAkcm91dGVQcm92aWRlclxuICAgICAgLndoZW4oJy9ob21lJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ3BhcnRpYWxzL2hvbWUnLFxuICAgICAgICBjb250cm9sbGVyOiAnaG9tZUNvbnRyb2xsZXInXG4gICAgICB9KVxuXG4gICAgICAud2hlbignL3Byb2ZpbGUnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAncGFydGlhbHMvcHJvZmlsZScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdwcm9maWxlQ29udHJvbGxlcicsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJ3Byb2ZpbGUnXG4gICAgICB9KVxuXG4gICAgICAud2hlbignL3JhbmtpbmcnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAncGFydGlhbHMvcmFua2luZycsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdyYW5raW5nQ29udHJvbGxlcicsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJ3JhbmtpbmcnXG4gICAgICB9KVxuXG4gICAgICAub3RoZXJ3aXNlKHtcbiAgICAgICAgcmVkaXJlY3RUbzogJy9ob21lJ1xuICAgICAgfSk7XG5cbiAgICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTtcblxuICAgICAgTm90aWZpY2F0aW9uUHJvdmlkZXIuc2V0T3B0aW9ucyh7XG4gICAgICAgIGRlbGF5OiA1MDAwLFxuICAgICAgICBzdGFydFRvcDogMjAsXG4gICAgICAgIHN0YXJ0UmlnaHQ6IDIwLFxuICAgICAgICB2ZXJ0aWNhbFNwYWNpbmc6IDIwLFxuICAgICAgICBob3Jpem9udGFsU3BhY2luZzogMjAsXG4gICAgICAgIHBvc2l0aW9uWDogJ3JpZ2h0JyxcbiAgICAgICAgcG9zaXRpb25ZOiAndG9wJ1xuICAgICAgfSk7XG4gICAgfSlcblxuICAgIC5ydW4oZnVuY3Rpb24gKCRyb290U2NvcGUsICRsb2NhdGlvbiwgQXV0aCkge1xuICAgICAgLy93YXRjaGluZyB0aGUgdmFsdWUgb2YgdGhlIGN1cnJlbnRVc2VyIHZhcmlhYmxlLlxuICAgICAgJHJvb3RTY29wZS4kd2F0Y2goJ2N1cnJlbnRVc2VyJywgZnVuY3Rpb24oY3VycmVudFVzZXIpIHtcbiAgICAgICAgQXV0aC5jdXJyZW50VXNlcigpO1xuICAgICAgfSk7XG4gICAgfSk7XG59KSgpO1xuIiwiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkoezE6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgb3JkaW5hbCA9IHJlcXVpcmUoJ29yZGluYWwtbnVtYmVyLXN1ZmZpeCcpO1xuXG5hbmd1bGFyXG4gIC5tb2R1bGUoJ3R3ZWV0c3RvY2tyJylcblxuICAvLyBUYWtlIGEgbnVtYmVyIGFuZCByZXR1cm5zIGl0cyBvcmRpbmFsIHZhbHVlXG4gIC8vIGkuZS4gMSAtPiAxc3QsIDIgLT4gMm5kLCBldGMuXG4gIC5maWx0ZXIoJ29yZGluYWwnLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgIHZhciBudW0gPSBwYXJzZUludChpbnB1dCwgMTApO1xuICAgICAgcmV0dXJuIGlzTmFOKG51bSkgPyBpbnB1dCA6IG9yZGluYWwobnVtKTtcbiAgICB9O1xuICB9KTtcblxufSx7XCJvcmRpbmFsLW51bWJlci1zdWZmaXhcIjoyfV0sMjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5cbi8qKlxuICogR2V0IHRoZSBvcmRpbmFsIG51bWJlciB3aXRoIHN1ZmZpeCBmcm9tIGBuYFxuICpcbiAqIEBhcGkgcHVibGljXG4gKiBAcGFyYW0ge051bWJlcn0gblxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobikge1xuICByZXR1cm4gbiArIGV4cG9ydHMuc3VmZml4KCtuKTtcbn07XG5cbi8qKlxuICogR2V0IHRoZSBzdWZmaXggZm9yIHRoZSBnaXZlbiBgbmBcbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBuXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMuc3VmZml4ID0gZnVuY3Rpb24gKG4pIHtcbiAgcmV0dXJuIE1hdGguZmxvb3IobiAvIDEwKSA9PT0gMVxuICAgICAgPyAndGgnXG4gICAgICA6IChuICUgMTAgPT09IDFcbiAgICAgICAgPyAnc3QnXG4gICAgICAgIDogKG4gJSAxMCA9PT0gMlxuICAgICAgICAgID8gJ25kJ1xuICAgICAgICAgIDogKG4gJSAxMCA9PT0gM1xuICAgICAgICAgICAgPyAncmQnXG4gICAgICAgICAgICA6ICd0aCcpKSk7XG59O1xuXG59LHt9XX0se30sWzFdKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGFuZ3VsYXJcbiAgICAubW9kdWxlKCd0d2VldHN0b2NrcicpXG4gICAgLmNvbnRyb2xsZXIoJ2hvbWVDb250cm9sbGVyJywgaG9tZUNvbnRyb2xsZXIpO1xuXG4gIGZ1bmN0aW9uIGhvbWVDb250cm9sbGVyKCRzY29wZSwgU29ja2V0LCBQb3J0Zm9saW8sIFNoYXJlcywgJGludGVydmFsLCAkdGltZW91dCwgJHJvb3RTY29wZSwgTm90aWZpY2F0aW9uKSB7XG4gICAgJHNjb3BlLnBvaW50cyA9IGZhbHNlO1xuICAgICRzY29wZS52YXJpYXRpb24gPSBmYWxzZTtcblxuICAgICRzY29wZS5zaG93UG9pbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUucG9pbnRzID0gZmFsc2U7XG4gICAgICAkc2NvcGUudmFyaWF0aW9uID0gZmFsc2U7XG5cbiAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAkc2NvcGUuc2hvd1ZhcmlhdGlvbnMoKTtcbiAgICAgIH0sIDUwMDApO1xuICAgIH1cblxuICAgICRzY29wZS5zaG93VmFyaWF0aW9ucyA9IGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLnBvaW50cyA9IHRydWU7XG4gICAgICAkc2NvcGUudmFyaWF0aW9uID0gdHJ1ZTtcblxuICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICRzY29wZS5zaG93UG9pbnRzKCk7XG4gICAgICB9LCA1MDAwKTtcbiAgICB9XG5cbiAgICAkc2NvcGUuc2hvd1BvaW50cygpO1xuXG4gICAgJHNjb3BlLmdldFBvcnRmb2xpbyA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCRzY29wZS5jdXJyZW50VXNlcikge1xuICAgICAgICBQb3J0Zm9saW8ucXVlcnkoZnVuY3Rpb24oc2hhcmVzKSB7XG4gICAgICAgICAgJHNjb3BlLnBvcnRmb2xpbyA9IHNoYXJlcztcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgICRzY29wZS5idXlTaGFyZSA9IGZ1bmN0aW9uKHN0b2NrKSB7XG4gICAgICB2YXIgc2hhcmUgPSBuZXcgU2hhcmVzKHtcbiAgICAgICAgc3RvY2s6IHN0b2NrLm5hbWUsXG4gICAgICAgIGFtb3VudDogc3RvY2suYW1vdW50XG4gICAgICB9KTtcblxuICAgICAgc2hhcmUuJHNhdmUoZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIGlmIChyZXMuc3VjY2VzcyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICBOb3RpZmljYXRpb24uZXJyb3IocmVzLm1lc3NhZ2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIE5vdGlmaWNhdGlvbi5zdWNjZXNzKCdZb3UgYm91Z2h0ICcgKyByZXMuc3RvY2sgKyAnIScpO1xuICAgICAgICAgICRyb290U2NvcGUuY3VycmVudFVzZXIgPSByZXMub3duZXI7XG4gICAgICAgICAgJHNjb3BlLmdldFBvcnRmb2xpbygpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLnNlbGxTaGFyZSA9IGZ1bmN0aW9uKHNoYXJlSWQpIHtcbiAgICAgIHZhciBzaGFyZSA9IFNoYXJlcy5nZXQoe1xuICAgICAgICBzaGFyZUlkIDogc2hhcmVJZFxuICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHNoYXJlLiRkZWxldGUoZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgTm90aWZpY2F0aW9uLnN1Y2Nlc3MoJ1lvdSBzb2xkICcgKyByZXMuc3RvY2sgKyAnIScpO1xuICAgICAgICAgICRyb290U2NvcGUuY3VycmVudFVzZXIgPSByZXMub3duZXI7XG4gICAgICAgICAgJHNjb3BlLmdldFBvcnRmb2xpbygpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICAkc2NvcGUuZ2V0U3RvY2tzID0gZnVuY3Rpb24oKSB7XG4gICAgICBTb2NrZXQuZW1pdCgndXBkYXRlLW1lJyk7XG4gICAgICAkc2NvcGUuZ2V0UG9ydGZvbGlvKCk7XG4gICAgfTtcblxuICAgICRzY29wZS5jaGFydE9wdGlvbnMgPSB7XG4gICAgICBzZXJpZXNCYXJEaXN0YW5jZTogMTUsXG4gICAgICBzaG93QXJlYTogdHJ1ZVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBnZXRSYW5kb21JbnQobWluLCBtYXgpIHtcbiAgICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSkgKyBtaW47XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIGRhdGFcbiAgICBcbiAgICBTb2NrZXQub24oJ3VwZGF0ZScsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICRzY29wZS5zdG9ja3MgPSBkYXRhO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8ICRzY29wZS5zdG9ja3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHN0b2NrID0gJHNjb3BlLnN0b2Nrc1tpXTtcbiAgICAgICAgdmFyIGRhdGFMZW5naHQgPSBzdG9jay5oaXN0b3J5Lmxlbmd0aDtcblxuICAgICAgICAvLyBHZXQgdmFyaWF0aW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgaWYgKHN0b2NrLmNvdW50ID4gMCAmJiBkYXRhTGVuZ2h0ID4gMSl7XG4gICAgICAgICAgaWYgKHN0b2NrLmhpc3RvcnlbMV0uY291bnQgPiAwKXtcbiAgICAgICAgICAgIC8vICggKGN1cnJlbnRQcmljZS9sYXN0UHJpY2UpLTEgKSAqIDEwMFxuICAgICAgICAgICAgdmFyIHZhcmlhdGlvbk51bWJlciA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICgoIHN0b2NrLmNvdW50IC8gc3RvY2suaGlzdG9yeVsxXS5jb3VudCApIC0gMSkgKiAxMDA7XG4gICAgICAgICAgICBzdG9jay52YXJpYXRpb24gPSBNYXRoLnJvdW5kKHZhcmlhdGlvbk51bWJlcikudG9GaXhlZCgwKSArICclJztcbiAgICAgICAgICAgIHN0b2NrLmxhc3RNb3ZlID0gKHZhcmlhdGlvbk51bWJlciA8IDApID8gJ2RhbmdlcicgOiAnc3VjY2Vzcyc7XG4gICAgICAgICAgICBzdG9jay5pY29uID0gKHZhcmlhdGlvbk51bWJlciA8IDApID8gJ2ZhLWNhcmV0LWRvd24nIDogJ2ZhLWNhcmV0LXVwJztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAgICAgLy8gUHJlcGFyZSBjaGFydCBkYXRhIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIHZhciBjaGFydERhdGEgPSB7fTtcblxuICAgICAgICBjaGFydERhdGEubGFiZWxzID0gW107XG4gICAgICAgIGNoYXJ0RGF0YS5zZXJpZXMgPSBbW11dO1xuXG4gICAgICAgIGZvciAodmFyIGkyID0gZGF0YUxlbmdodC0xOyBpMiA+PSAwOyBpMi0tKXtcbiAgICAgICAgICB2YXIgZCA9IG5ldyBEYXRlKHN0b2NrLmhpc3RvcnlbaTJdLmNyZWF0ZWQpO1xuICAgICAgICAgIHZhciBsYWJlbCA9IGQuZ2V0SG91cnMoKSArICc6JyArIGQuZ2V0TWludXRlcygpO1xuXG4gICAgICAgICAgY2hhcnREYXRhLnNlcmllc1swXS5wdXNoKHN0b2NrLmhpc3RvcnlbaTJdLmNvdW50KTtcbiAgICAgICAgICBjaGFydERhdGEubGFiZWxzLnB1c2gobGFiZWwpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RvY2suY2hhcnREYXRhID0gY2hhcnREYXRhO1xuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgIH1cblxuICAgICAgJHNjb3BlLnJlc3BvbnNlUmVjZWl2ZWQgPSB0cnVlO1xuICAgICAgJHNjb3BlLmdldFBvcnRmb2xpbygpO1xuICAgIH0pO1xuXG4gICAgU29ja2V0Lm9uKCd1cGRhdGUtZGF0ZScsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICRzY29wZS5zdG9ja3NVcGRhdGVkQXQgPSBuZXcgRGF0ZShkYXRhKTtcbiAgICB9KTtcbiAgfVxufSkoKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGFuZ3VsYXJcbiAgICAubW9kdWxlKCd0d2VldHN0b2NrcicpXG4gICAgLmNvbnRyb2xsZXIoJ3Byb2ZpbGVDb250cm9sbGVyJywgcHJvZmlsZUNvbnRyb2xsZXIpO1xuXG4gIGZ1bmN0aW9uIHByb2ZpbGVDb250cm9sbGVyKEF1dGgsICRsb2NhdGlvbiwgUmVzZXRBY2NvdW50LCAkd2luZG93LCAkcm9vdFNjb3BlKSB7XG4gICAgdmFyIHZtID0gdGhpcztcblxuICAgIC8vIFNldHRpbmcgbmFtZS91c2VybmFtZSB0byBuYW1lL3VzZXJuYW1lIGZpZWxkIG9uIHZpZXcuXG4gICAgdm0ubmFtZSA9ICRyb290U2NvcGUuY3VycmVudFVzZXIubmFtZVxuICAgIHZtLnVzZXJuYW1lID0gJHJvb3RTY29wZS5jdXJyZW50VXNlci51c2VybmFtZVxuXG4gICAgdm0ubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICBBdXRoLmxvZ291dChmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgaWYoIWVycikge1xuICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvJyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICB2bS5yZXNldEFjY291bnQgPSBmdW5jdGlvbigpIHtcbiAgICAgIFJlc2V0QWNjb3VudC5zYXZlKFxuICAgICAgICBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICAkd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnaHR0cDovLycgKyAkd2luZG93LmxvY2F0aW9uLmhvc3Q7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICB2bS5vcGVuTW9kYWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2bS5jb25maXJtTW9kYWwgPSB0cnVlO1xuICAgIH1cblxuICAgIHZtLmNsb3NlTW9kYWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2bS5jb25maXJtTW9kYWwgPSBmYWxzZTtcbiAgICB9XG4gIH1cbn0pKCk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBhbmd1bGFyXG4gICAgLm1vZHVsZSgndHdlZXRzdG9ja3InKVxuICAgIC5jb250cm9sbGVyKCdyYW5raW5nQ29udHJvbGxlcicsIHJhbmtpbmdDb250cm9sbGVyKTtcblxuICBmdW5jdGlvbiByYW5raW5nQ29udHJvbGxlcihSYW5raW5nKSB7XG4gICAgdmFyIHZtID0gdGhpcztcblxuICAgIHZtLmZpbmQgPSBmdW5jdGlvbigpIHtcbiAgICAgIFJhbmtpbmcucXVlcnkoZnVuY3Rpb24ocmFua2luZykge1xuICAgICAgICB2bS51c2VycyA9IHJhbmtpbmc7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgdm0uZmluZCgpO1xuICB9XG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgYW5ndWxhclxuICAgIC5tb2R1bGUoJ3R3ZWV0c3RvY2tyJylcbiAgICAuZGlyZWN0aXZlKCduYXZiYXInLCBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ3NoYXJlZC9uYXZiYXInXG4gICAgICB9O1xuICAgIH0pO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBhbmd1bGFyXG4gICAgLm1vZHVsZSgndHdlZXRzdG9ja3InKVxuICAgIC5mYWN0b3J5KCdBdXRoJywgQXV0aCk7XG5cbiAgZnVuY3Rpb24gQXV0aCgkcm9vdFNjb3BlLCAkY29va2llcywgJHJlc291cmNlKSB7XG4gICAgJHJvb3RTY29wZS5jdXJyZW50VXNlciA9IGFuZ3VsYXIuZnJvbUpzb24oJGNvb2tpZXMuZ2V0KCd1c2VyJykpIHx8IG51bGw7XG4gICAgJGNvb2tpZXMucmVtb3ZlKCd1c2VyJyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgY3VycmVudFVzZXI6IGZ1bmN0aW9uKCkge30sXG5cbiAgICB9O1xuICB9XG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgYW5ndWxhclxuICAgIC5tb2R1bGUoJ3R3ZWV0c3RvY2tyJylcbiAgICAuZmFjdG9yeSgnUG9ydGZvbGlvJywgUG9ydGZvbGlvKTtcblxuICBmdW5jdGlvbiBQb3J0Zm9saW8oJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZSgnYXBpL3BvcnRmb2xpby8nKTtcbiAgfVxufSkoKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGFuZ3VsYXJcbiAgICAubW9kdWxlKCd0d2VldHN0b2NrcicpXG4gICAgLmZhY3RvcnkoJ1JhbmtpbmcnLCBSYW5raW5nKTtcblxuICBmdW5jdGlvbiBSYW5raW5nKCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoJ2FwaS9yYW5raW5nLycpO1xuICB9XG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgYW5ndWxhclxuICAgIC5tb2R1bGUoJ3R3ZWV0c3RvY2tyJylcbiAgICAuZmFjdG9yeSgnUmVzZXRBY2NvdW50JywgUmVzZXRBY2NvdW50KTtcblxuICBmdW5jdGlvbiBSZXNldEFjY291bnQoJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZSgnL2F1dGgvcmVzZXQvOnVzZXJJZCcpO1xuICB9XG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gaG93IGl0IHdvcmtzIGhlcmU6XG4gIC8vIGh0dHA6Ly93d3cuc2l0ZXBvaW50LmNvbS9jcmVhdGluZy1jcnVkLWFwcC1taW51dGVzLWFuZ3VsYXJzLXJlc291cmNlL1xuXG4gIGFuZ3VsYXJcbiAgICAubW9kdWxlKCd0d2VldHN0b2NrcicpXG4gICAgLmZhY3RvcnkoJ1NoYXJlcycsIFNoYXJlcyk7XG5cbiAgZnVuY3Rpb24gU2hhcmVzKCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoJ2FwaS9zaGFyZXMvOnNoYXJlSWQnLCB7XG4gICAgICBzaGFyZUlkOiAnQF9pZCdcbiAgICB9LCB7XG4gICAgICB1cGRhdGU6IHtcbiAgICAgICAgbWV0aG9kOiAnUFVUJ1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgYW5ndWxhclxuICAgIC5tb2R1bGUoJ3R3ZWV0c3RvY2tyJylcbiAgICAuZmFjdG9yeSgnU29ja2V0JywgU29ja2V0KTtcblxuICBmdW5jdGlvbiBTb2NrZXQoJHJvb3RTY29wZSkge1xuICAgIC8vIHZhciBzb2NrZXQgPSBpby5jb25uZWN0KCdodHRwOi8vbG9jYWxob3N0OjMwMDAnKTtcbiAgICB2YXIgc29ja2V0ID0gaW8uY29ubmVjdCgnaHR0cDovL3d3dy50d2VldHN0b2Nrci5jb20nKTtcblxuICAgIHJldHVybiB7XG4gICAgICBvbjogZnVuY3Rpb24gKGV2ZW50TmFtZSwgY2FsbGJhY2spIHtcbiAgICAgICAgZnVuY3Rpb24gd3JhcHBlcigpIHtcbiAgICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAkcm9vdFNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjYWxsYmFjay5hcHBseShzb2NrZXQsIGFyZ3MpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgc29ja2V0Lm9uKGV2ZW50TmFtZSwgd3JhcHBlcik7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBzb2NrZXQucmVtb3ZlTGlzdGVuZXIoZXZlbnROYW1lLCB3cmFwcGVyKTtcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgICBlbWl0OiBmdW5jdGlvbiAoZXZlbnROYW1lLCBkYXRhLCBjYWxsYmFjaykge1xuICAgICAgICBzb2NrZXQuZW1pdChldmVudE5hbWUsIGRhdGEsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAkcm9vdFNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZihjYWxsYmFjaykge1xuICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShzb2NrZXQsIGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59KSgpO1xuXG4iLCIoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBhbmd1bGFyXG4gICAgLm1vZHVsZSgndHdlZXRzdG9ja3InKVxuICAgIC5mYWN0b3J5KCdVc2VyJywgVXNlcik7XG5cbiAgZnVuY3Rpb24gVXNlcigkcmVzb3VyY2UpIHtcbiAgICByZXR1cm4gJHJlc291cmNlKCcvYXV0aC91c2VyLzppZC8nLCB7fSxcbiAgICB7XG4gICAgICAndXBkYXRlJzoge1xuICAgICAgICBtZXRob2Q6J1BVVCdcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufSkoKTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
