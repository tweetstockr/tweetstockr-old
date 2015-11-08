/*
  TWEET-O-METER
  1 - Obtém lista de Trending Topics atualizada do Twitter (só é possível fazer
      isso a cada 15 minutos)
  2 - Com a lista de TT, iniciar um streaming buscando as TT e contando as
      ocorrências nos Tweets
  3 - Após 1 minuto de streaming, contabilizar o total contado de cada TT, isto
      é o valor do TT no game
  4 - Armazenar os valores atualizados no banco de dados
*/

'use strict';

var twitter     = require('twitter');
var configAuth  = require('./config/credentials');
var strings     = require('./config/strings');
var StockModel   = require('./models/stock');
var TrendsModel  = require('./models/trends');
var refreshTweetsCountRate = 60000; // Interval to wait before update Tweets count
var refreshTrendsRate = 15 * 60000; // Interval to wait before update Trends list
var woeid = 23424768; // TT location id: 1 = location worldwide, 23424768 = BR
var currentTrends = []; // The current Trending Topics
var lastUpdateDate = new Date();
var lastTrends = []; // The last count

module.exports = function(server) {
  // Get last available count for current TTs
  // Use this when the server has just started and the count is not ready
  console.log('-- Get from MONGO last available count for current TTs');

  sendListToClient();

  var io = require('socket.io').listen(server);

  // When the user connect, send updated data
  io.on('connection', function (socket) {
      socket.on('update-me', function() {
        io.emit('update', lastTrends);
        io.emit('update-date', lastUpdateDate);
      });
  });

  // Initialize Twitter API
  var clientTwitter = null;

  function resetTwitterStream() {
    clientTwitter = new twitter({
      consumer_key        : configAuth.twitterAuth.consumerKey,
      consumer_secret     : configAuth.twitterAuth.consumerSecret,
      access_token_key    : configAuth.twitterAuth.accessTokenKey,
      access_token_secret : configAuth.twitterAuth.accessTokenSecret,
    });
  }

  resetTwitterStream();
  startTwitterStream();

  // Updates the Trending Topics list
  // It can only be called once in 15 minutes due to Twitter API limitation
  function updateTrendsList() {
    var nowMinus15Minutes = new Date(new Date() - refreshTrendsRate);

    TrendsModel.find(
      { 'created' :
        { '$gte' : nowMinus15Minutes, '$lt' : new Date() }
      },
      function (err, results) {
        if(err) {
          return console.error(err);
        }

        // No update in the last 15 minutes, so... update it!
        if(!results.length) {
          console.log('-- Renew TTs list');

          // Trends location: Yahoo's Where On Earth Id
          // https://developer.yahoo.com/geo/geoplanet/
          clientTwitter.get('trends/place', { 'id' : woeid },
            function(error, result, response) {
              if(error) {
                throw error;
              }

              // Trends list updated!
              console.log('-- TTs list updated: ' + JSON.stringify(result[0].trends));

              //Store trends on database
              var newTrends = new TrendsModel({
                woeid : woeid,
                list : result[0].trends,
              });

              newTrends.save(function(err, newTrends) {
                if(err) {
                  return console.error(err);
                }
              });
            }
          );
        }
      }
    );
  }

  // Get the trends and fetch the price and price history
  // then update the lastTrends list
  function sendListToClient() {
    TrendsModel.getNewestStoredTT(function(err, trends) {
      if(err) {
        return console.log(err);
      }

      if(!trends) {
        return console.log(strings.wait_tweet_count);
      }

      var tt = [];
      var stocksWithPrice = 0;

      // Clone the Trends
      var trendsObj = JSON.parse(JSON.stringify(trends));

      for(var i = 0; i < trendsObj.list.length; i++) {
        var stock = trendsObj.list[i];
        console.log(stock.name);

        tt.push({
          name : stock.name,
          count : 0,
          history : [],
        });

        // For each stock, get last computed prices
        StockModel.getLastPrices(stock.name, function(err, stocks) {
          stocksWithPrice++;

          // only if I found the prices, update tt
          if(stocks.length) {
            // search for TT in tt list and update prices
            for(var i2 = 0; i2 < tt.length; i2++) {
              if(tt[i2].name === stocks[0].name) {
                // get historcal price data for charts
                var priceHistory = [];

                for(var i3 = 0; i3 < stocks.length; i3++) {
                  priceHistory.push({
                    count : stocks[i3].price || 0,
                    created : stocks[i3].created
                  });
                }

                tt[i2].count = stocks[0].price || 0;
                tt[i2].history = priceHistory;

                break;
              }
            }

          }

          if(stocksWithPrice === trendsObj.list.length) {
            lastTrends = JSON.parse(JSON.stringify(tt));
            lastUpdateDate = Date();
            // console.log('-- Send to the User: ');
            // console.log(JSON.stringify(lastTrends));
            io.emit('update', lastTrends);
            io.emit('update-date', lastUpdateDate);
          }
        });
      }
    });
  }


  // Count Tweets!
  function startTwitterStream() {
    console.log('-- Start Twitter stream');

    sendListToClient();

    // Find updated Trends list from db
    TrendsModel.getNewestStoredTT(function(err, trends) {
      if(err) {
        return console.error(err);
      }

      if(!trends) {
        return console.log(strings.wait_tweet_count);
      }

      // Clone the Trends
      var trendsObj = JSON.parse(JSON.stringify(trends));

      // If the list was found, start streaming
      if(trendsObj.list ) {
        // get only the name of the trending topics and put it into a string -
        var search = [];

        for(var i = 0; i < trendsObj.list.length; i++) {
          search.push(trendsObj.list[i].name);
        }

        var streamQuery = search.join(',');

        // Copy and prepare array
        currentTrends = JSON.parse(JSON.stringify(trendsObj.list));

        for(var i = 0; i < currentTrends.length; i++) {
          currentTrends[i].count = 0;
        }

        console.log('-- Starting Twitter stream with the following keywords: \n' + streamQuery);

        // searching for streamQuery
        clientTwitter.stream('statuses/filter', {
          track: streamQuery
        }, function(stream) {
          stream.on('data', function(tweet) {
            // Search word in tweet text and update tweets count
            for(var key in currentTrends) {
              var q = currentTrends[key].name;

              if(tweet.text) {
                var n = tweet.text.search(q);

                if(n !== -1) {
                  currentTrends[key].count ++;
                }
              }
            }
          });

          stream.on('error', function(error) {
            console.log(error);
          });
        });
      }
    });
  }

  // Get counted Tweets and store in the database
  var tweetCounter = setInterval(function() {
    // Stop Counting!
    console.log('-- Stop counting!');
    resetTwitterStream();
    sendListToClient();

    console.log('-- Last Trends with count: ' + JSON.stringify(currentTrends));

    // Got an updated count
    for(var key in currentTrends) {
      // Save stock to database
      var newStockModel = new StockModel({
        name: currentTrends[key].name
      , price: currentTrends[key].count
      , date: lastUpdateDate
      });

      newStockModel.save(function(err, newStockModel) {
        if(err) {
          console.error(err);
        }
      });
      currentTrends[key].count = 0;
    }

    updateTrendsList();
  }, refreshTweetsCountRate);
};
