(function() {
  'use strict';

  angular
    .module('tweetstockr', ['ngRoute', 'angular-chartist', 'ui-notification'])
    .constant('CONFIG', {
      apiUrl: 'http://api.tweetstockr.com'
    })
    .config(["$routeProvider", "$locationProvider", "NotificationProvider", function ($routeProvider, $locationProvider, NotificationProvider) {

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
          function successCallback(response) {
            onSuccess(response);
          },
          function errorCallback(response) {
            onError(response);
          }
        );
      }
    };
  }
})();

(function() {
  'use strict';

  marketService.$inject = ["$rootScope", "CONFIG", "networkService"];
  angular
    .module('tweetstockr')
    .factory('marketService', marketService);

  function marketService ($rootScope, CONFIG, networkService) {
    return {
      buy: function (name, quantity, onSuccess, onError) {
        networkService.postAuth(
          CONFIG.apiUrl + '/trade/buy',
          {stock: name, amount: quantity},
          function successCallback(response) {
            $rootScope.updateCurrentUser();
            onSuccess(response);
          },
          function errorCallback(response) {
            onError(response);
          }
        );
      },
      sell: function(shareId, onSuccess, onError) {
        networkService.postAuth(
          CONFIG.apiUrl + '/trade/sell',
          { trade : shareId },
          function successCallback(response){
            $rootScope.updateCurrentUser();
            onSuccess(response);
          },
          function errorCallback(response) {
            onError(response);
          }
        );
      }
    };
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
            if (response.data.redirect_to) {
              window.location = response.data.redirect_to;
            }

            if (response.data.success) {
              onSuccessCallback(response.data);
            } else {
              onErrorCallback(response.data || {'message':'Sorry! An error ocurred.'});
            }
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
            if (response.data.redirect_to) {
              window.location = response.data.redirect_to;
            }

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
            if (response.data.redirect_to) {
              window.location = response.data.redirect_to;
            }

            onSuccessCallback(response.data);
          }, function getError(response) {
            onErrorCallback({'message':'Error: Could not connect to the server.'});
            console.log('GET error: ' + response);
          });
        }
      };
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
          function successCallback(response) {
            onSuccess(response);
          },
          function errorCallback(response) {
            onError(response);
          }
        );
      }
    };
  }
})();

(function() {
  'use strict';

  tournamentService.$inject = ["CONFIG", "networkService"];
  angular
    .module('tweetstockr')
    .factory('tournamentService', tournamentService);

  function tournamentService (CONFIG, networkService) {
    return {
      getActiveTournaments: function (onSuccess, onError) {
        networkService.getAuth(
          CONFIG.apiUrl + '/tournaments',
          function successCallback(response) {
            onSuccess(response);
          },
          function errorCallback(response) {
            onError(response);
          }
        );
      }
    };
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
          function successCallback(response) {
            onSuccess(response);
          },
          function errorCallback(response) {
            onError(response);
          }
        );
      },
      getBalance: function (onSuccess, onError) {
        networkService.getAuth(
          CONFIG.apiUrl + '/balance',
          function successCallback(response) {
            onSuccess(response);
          },
          function errorCallback(response) {
            onError(response);
          }
        );
      },
      resetAccount: function (onSuccess, onError) {
        networkService.postAuth(
          CONFIG.apiUrl + '/reset', {},
          function successCallback(response) {
            $rootScope.updateCurrentUser();
            onSuccess(response);
          },
          function errorCallback(response) {
            onError(response);
          }
        );
      }
    };
  }
})();

(function() {
  'use strict';

  walletService.$inject = ["$http", "$rootScope", "networkService", "CONFIG"];
  angular
    .module('tweetstockr')
    .factory('walletService', walletService);

  function walletService ($http, $rootScope, networkService, CONFIG) {
    return {
      getTransactions: function (onSuccess, onError) {
        networkService.getAuth(
          CONFIG.apiUrl + '/statement',
          function successCallback(response) {
            onSuccess(response);
          },
          function errorCallback(response) {
            onError(response);
          }
        );
      },
      getStats: function (onSuccess, onError) {
        networkService.getAuth(
          CONFIG.apiUrl + '/stats',
          function successCallback(response) {
            onSuccess(response);
          },
          function errorCallback(response) {
            onError(response);
          }
        );
      }
    };
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

  headerController.$inject = ["$rootScope", "$scope", "userService"];
  angular
    .module('tweetstockr')
    .controller('headerController', headerController);

  function headerController ($rootScope, $scope, userService) {
    $rootScope.updateCurrentUser = function () {
      userService.getProfile(
        function onSuccess(response) {
          $scope.username = response.user.twitter.displayName;
          $scope.twitterUser = response.user.twitter.username;
          $scope.balance = response.balance;
          $scope.ranking = response.ranking;
          $scope.tokens = response.user.tokens;
          // These are not being used yet...
          $scope.profileImage = response.user.twitter.profile_image;
          $scope.profileImageThumb = response.user.twitter.profile_image_normal;
          $scope.twitterUrl = 'https://twitter.com/' + response.user.twitter.username;
        },
        function onError(data) {
          console.log('Error: ' + data.message);
        }
      );
    };

    $rootScope.updateCurrentUser();
  }
})();

(function() {
  'use strict';

  marketController.$inject = ["$rootScope", "$scope", "portfolioService", "networkService", "marketService", "CONFIG", "Notification"];
  angular
    .module('tweetstockr')
    .controller('marketController', marketController);

  function marketController ($rootScope, $scope, portfolioService, networkService, marketService, CONFIG, Notification) {
    var socket = io(CONFIG.apiUrl);
    $scope.loading = false;

    socket.on('connect', function () {
      console.log('connected!');
      socket.emit('update-me');
      $scope.loading = true;
    });

    // Update Countdown ========================================================
    function getTimeRemaining(endtime) {
      var t = Date.parse(endtime) - Date.parse(new Date());
      var seconds = Math.floor((t / 1000) % 60);
      var minutes = Math.floor((t / 1000 / 60) % 60);
      var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
      var days = Math.floor(t / (1000 * 60 * 60 * 24));
      return {
        'total': t,
        'days': days,
        'hours': hours,
        'minutes': minutes,
        'seconds': seconds
      };
    }

    function initializeClock(endtime) {
      function updateClock() {
        var t = getTimeRemaining(endtime);

        if (t.total > 0) {
          var timeString = ('0' + t.minutes).slice(-2) + ':' + ('0' + t.seconds).slice(-2);
          $scope.$apply(function() {
            $scope.nextUpdateIn = timeString;
          });
        } else {
          $scope.$apply(function() {
            $scope.nextUpdateIn = '00:00';
          });
          clearInterval(timeinterval);
        }
      }

      updateClock();
      var timeinterval = setInterval(updateClock, 1000);
    }

    socket.on('update-date', function(data) {
      var deadline = new Date(data.nextUpdate);
      initializeClock(deadline);
    });
    // =========================================================================

    socket.on('update', function (data) {
      $scope.stocks = data;

      for (var i = 0; i < $scope.stocks.length; i++) {
        var stock = $scope.stocks[i];
        var dataLenght = stock.history.length;

        if (stock.price > 0 && dataLenght > 1) {
          if (stock.history[1].price > 0) {
            var variationNumber = (( stock.price / stock.history[1].price ) - 1) * 100;
            stock.variation = Math.round(variationNumber).toFixed(0) + '%';
            stock.lastMove = (variationNumber < 0) ? 'danger' : 'success';
            stock.icon = (variationNumber < 0) ? 'fa-caret-down' : 'fa-caret-up';
          }
        }

        var chartData = {};
        chartData.labels = [];
        chartData.series = [[]];

        for (var j = dataLenght-1; j >= 0; j--) {
          var time = new Date(stock.history[j].created);
          var label = time.getHours() + ':' + time.getMinutes();

          chartData.series[0].push(stock.history[j].price);
          chartData.labels.push(label);
        }

        stock.chartData = chartData;
      }

      $scope.$apply();
    });

    $scope.chartOptions = {
      showArea: true
    }

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

    $scope.sellShare = function(share) {
      $scope.stockBtn = true;

      marketService.sell(share.tradeId,
        function successCallback(response) {
          $scope.getPortfolio();
          Notification.success(response.message);
        },
        function errorCallback(response) {
            Notification.error(response.message);
        }
      );
    };

    $scope.buyShare = function(name, quantity) {
      $scope.stockBtn = true;

      marketService.buy(name, quantity,
        function successCallback(response) {
          Notification.success(response);
          var audio = document.getElementById('audio');
          audio.play();
          $scope.getPortfolio();
        },
        function errorCallback(response) {
          Notification.error(response.message);
        }
      );
    };

    $scope.getPortfolio = function () {
      portfolioService.getPortfolio(
        function onSuccess(data) {
          $scope.portfolio = data;
          $scope.loading = true;
          $scope.stockBtn = false;
        },
        function onError(data) {
          Notification.error(data.message);
          console.log('Portfolio Error: ' + data.message);
        }
      );
    };
  }
})();

(function() {
  'use strict';

  profileController.$inject = ["$rootScope", "$scope", "userService", "Notification"];
  angular
    .module('tweetstockr')
    .controller('profileController', profileController);

  function profileController ($rootScope, $scope, userService, Notification) {
    $rootScope.updateCurrentUser();
    $scope.loading = false;

    $scope.resetAccount = function () {
      userService.resetAccount(
        function successCallback(response) {
          $scope.loading = true;
          
          if (response.message) {
            Notification.success(response.message);
          }
        },
        function errorCallback(response) {
          if (response.message) {
            Notification.error(response.message);
          }
        }
      );
    };
  }
})();

(function() {
  'use strict';

  rankingController.$inject = ["$scope", "leaderboardService"];
  angular
    .module('tweetstockr')
    .controller('rankingController', rankingController);

  function rankingController ($scope, leaderboardService) {
    $scope.loading = false;
    
    leaderboardService.getRanking(
      function onSuccess(response) {
        $scope.rankingList = response;
        $scope.loading = true;
      },
      function onError(response) {
        console.log('error: ', JSON.stringify(response));
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

  tournamentsController.$inject = ["$scope", "tournamentService"];
  angular
    .module('tweetstockr')
    .controller('tournamentsController', tournamentsController);

  function tournamentsController ($scope, tournamentService) {
    $scope.loading = false;

    tournamentService.getActiveTournaments(
      function onSuccess(response) {
        $scope.tournamentsList = response;
        $scope.loading = true;
      },
      function onError(response) {
        console.log('error: ', JSON.stringify(response));
      }
    );
  }
})();

(function() {
  'use strict';

  walletController.$inject = ["$scope", "walletService"];
  angular
    .module('tweetstockr')
    .controller('walletController', walletController);

  function walletController ($scope, walletService) {
    $scope.loading = false;

    walletService.getTransactions(
      function successCallback(response) {
        $scope.transactionList = response;
        $scope.loading = true;
      },
      function errorCallback(response) {
        console.log('error: ', JSON.stringify(response));
      }
    );

    walletService.getStats(
      function successCallback(response) {
        $scope.stats = response;
      },
      function errorCallback(response) {
        console.log('error: ', JSON.stringify(response));
      }
    );
  }
})();
