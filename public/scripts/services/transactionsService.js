(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .factory('transactionsService', transactionsService);

  function transactionsService () {
    var transactionsList = [
      {
          "name": "#AllFandomsHereForSyria"
        , "amount": "18"
        , "date": "2015-12-215T16:21:37+00:00"
        , "points": 901
        , "sell": false
        , "buy": true
      },

      {
          "name": "#AllFandomsHereForSyria"
        , "amount": "01"
        , "date": "2015-12-31T20:07:44+00:00"
        , "points": 651
        , "sell": false
        , "buy": true
      },

      {
          "name": "VOTE LOVATICS"
        , "amount": "01"
        , "date": "2016-01-15T01:23:37+00:00"
        , "points": 93
        , "sell": false
        , "buy": true
      },

      {
          "name": "#50sfumaturedigrigio"
        , "amount": "02"
        , "date": "2016-01-12T17:17:12+00:00"
        , "points": 129
        , "sell": true
        , "buy": false
      },

      {
          "name": "#50sfumaturedigrigio"
        , "amount": "04"
        , "date": "2016-01-23T21:22:14+00:00"
        , "points": 1029
        , "sell": true
        , "buy": false
      },

      {
          "name": "#50sfumaturedigrigio"
        , "amount": "20"
        , "date": "2016-01-02T13:21:25+00:00"
        , "points": 1298
        , "sell": true
        , "buy": false
      },

      {
          "name": "#TopChef"
        , "amount": "11"
        , "date": "2016-01-22T06:07:37+00:00"
        , "points": 9182
        , "sell": false
        , "buy": true
      },

      {
          "name": "#TopChef"
        , "amount": "05"
        , "date": "2016-01-25T19:07:37+00:00"
        , "points": 12
        , "sell": false
        , "buy": true
      },

      {
          "name": "#TopChef"
        , "amount": "3"
        , "date": "2016-01-25T20:12:39+00:00"
        , "points": 323
        , "sell": false
        , "buy": true
      },

      {
          "name": "#RoyalRumble"
        , "amount": "11"
        , "date": "2016-01-25T04:06:17+00:00"
        , "points": 1009
        , "sell": false
        , "buy": true
      }
    ];

    return {
      getTransactions: function () {
        return transactionsList;
      }
    }
  }
})();