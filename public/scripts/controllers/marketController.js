(function() {
  'use strict';

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
