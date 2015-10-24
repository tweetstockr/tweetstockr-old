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
