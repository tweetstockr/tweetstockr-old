/*
 *  twitterStream.js
 *
 *  Stream Twitter with current Trending Topics
 *  Count Tweets while streaming
 *  Send updated Tweets count to client and update Mongo documents
 *
 */

var twitter     = require('twitter');
var TrendsModel  = require('./models/trends');
var strings     = require('./config/strings');
var StockModel   = require('./models/stock');
var configAuth  = require('./config/credentials');


// Initialize Twitter API
var clientTwitter = null;

var currentTrends = []; // The current Trending Topics
var lastUpdateDate = new Date();
var lastTrends = []; // The last count



module.exports = function(server){

  var io = require('socket.io').listen(server);

  // Count Tweets!
  // Get lastest TTs list and serch for terms in Twitter stream
  this.startTwitterStream = function() {

    // When the user connect, send updated data
    io.on('connection', function (socket) {
        socket.on('update-me', function() {
          io.emit('update', lastTrends);
          io.emit('update-date', lastUpdateDate);
        });
    });

    console.log('-- Start Twitter stream');

    this.sendListToClient();

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



  this.resetTwitterStream = function() {

    clientTwitter = new twitter({
      consumer_key        : configAuth.twitterAuth.consumerKey,
      consumer_secret     : configAuth.twitterAuth.consumerSecret,
      access_token_key    : configAuth.twitterAuth.accessTokenKey,
      access_token_secret : configAuth.twitterAuth.accessTokenSecret,
    });

  }




  // Get the trends and fetch the price and price history
  // then update the lastTrends list
  this.sendListToClient = function() {

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
            console.log('-- Sending new values to client');
            // console.log(JSON.stringify(lastTrends));
            io.emit('update', lastTrends);
            io.emit('update-date', lastUpdateDate);
          }
        });
      }
    });

    console.log('-- Last Trends with count: ' + JSON.stringify(currentTrends));


    // Save an updated count
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

  }



}
