(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('marketController', marketController);

  function marketController ($scope, $route, $routeParams, $http, portfolioService) {
    var socket = io('http://localhost:4000');

    socket.on('connect', function () {
      console.log('connected!');
      socket.emit('update-me');
    });

    socket.on('update', function (trends) {
      $scope.chartOptions = {
          seriesBarDistance: 15
        , showArea: true
      };

      $scope.trendsList = trends;

      for(var i = 0; i < $scope.trendsList.length; i++) {
        $scope.trendsList[i].chartData = {
            label: []
          , series: [[]]
        };

        var series = $scope.trendsList[i].chartData.series[0];
        var label = $scope.trendsList[i].chartData.label;

        for(var j = 0; j < $scope.trendsList[i].history.length; j++) {
          var prices = JSON.stringify($scope.trendsList[i].history[j].price);
          var time = new Date($scope.trendsList[i].history[j].created);

          series.push(prices);
          label.push(time);
        }
      }

      console.log('Trends List: ', $scope.trendsList);
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

    $scope.buyShare = function(name, quantity) {

      var audio = document.getElementById('audio');
      audio.play();
      
      $http({
        method: 'POST',
        url: 'http://localhost:4000/trade/buy',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        transformRequest: function(obj) {
            var str = [];
            for(var p in obj)
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            return str.join("&");
        },
        data: {
          stock: name,
          amount: quantity
        },
        withCredentials: true
      }).then(function successCallback(response) {

        if (response.data.success) {
          alert(response.data.message); // You have purchased #blablabla
          $scope.getPortfolio();
        }
        else
          alert(response.data.message); // You do not have enough points

      }, function errorCallback(response) {
        console.log('Buy Share Account Error: ' +  response);
      });
    }

    $scope.getPortfolio = function () {
      portfolioService.getPortfolio(
        function (success) {
          console.log('Portfolio Success: ' +  success);
        },
        function (error) {
          console.log('Portfolio Error: ' + error);
        }
      )
    }
  }
})();
