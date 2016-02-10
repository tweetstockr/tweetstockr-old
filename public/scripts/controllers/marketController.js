(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('marketController', marketController);

  function marketController ($rootScope, $scope, portfolioService, networkService, marketService, CONFIG, Notification) {
    var socket = io(CONFIG.apiUrl);

    socket.on('connect', function () {
      console.log('connected!');
      socket.emit('update-me');
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
        var timeString = ('0' + t.minutes).slice(-2) + ':' + ('0' + t.seconds).slice(-2);

        $scope.$apply(function() {
          $scope.nextUpdateIn = timeString;
        });

        if (t.total <= 0) {
          var timeinterval = setInterval(updateClock, 1000);
          clearInterval(timeinterval);
        }
      }

      updateClock();
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
      marketService.sell(share.tradeId,
        function successCallback(response) {
          Notification.success(response.message);
          $scope.getPortfolio();
        },
        function errorCallback(response) {
            Notification.error(response.message);
        }
      );
    };

    $scope.buyShare = function(name, quantity) {
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
        },
        function onError(data) {
          Notification.error(data.message);
          console.log('Portfolio Error: ' + data.message);
        }
      );
    };
  }
})();
