(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('homeController', homeController);

  function homeController($scope, Socket, Portfolio, Shares, $interval, $timeout, $rootScope) {
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
          alert(res.message);
        } else {
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

      // Prepare chart data ----------------------------------------------------
      for (var i = 0; i < $scope.stocks.length; i++){

        var stock = $scope.stocks[i];
        var dataLenght = stock.history.length;

        var chartData = {};
        chartData.labels = [];
        chartData.series = [[]];

        for (var i2 = dataLenght-1; i2 >= 0; i2--){
          var d = new Date(stock.history[i2].created);
          var label = d.getHours() + ":" + d.getMinutes();

          chartData.series[0].push(stock.history[i2].count);
          chartData.labels.push(label);
        }

        stock.chartData = chartData;
      }
      $scope.responseReceived = true;
      // -----------------------------------------------------------------------

      $scope.getPortfolio();
    });

    Socket.on('update-date', function(data) {
      $scope.stocksUpdatedAt = new Date(data);
    });
  }
})();
