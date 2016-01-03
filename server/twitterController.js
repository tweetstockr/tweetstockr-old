/*
 *  twitterController.js
 *
 *  Gets a new list of TTs every[refreshTrendsRate] milliseconds
 *  Save TTs historical prices
 *
 */

'use strict';

var TrendsModel = require('./models/trends');
var StockModel  = require('./models/stock');

var configAuth  = require('./config/credentials');
var config = require('./config/config');


var clientTwitter = new require('twitter')({
      consumer_key        : configAuth.twitterAuth.consumerKey,
      consumer_secret     : configAuth.twitterAuth.consumerSecret,
      access_token_key    : configAuth.twitterAuth.accessTokenKey,
      access_token_secret : configAuth.twitterAuth.accessTokenSecret,
    });

module.exports = function(server) {

  // Interval to wait before update Trends list
  // From Twitter:
  // "This information is cached for 5 minutes.
  // Requesting more frequently than that will not return any more
  // data, and will count against your rate limit usage."
  // "There are two initial buckets available for GET requests:
  // 15 calls every 15 minutes, and 180 calls every 15 minutes."

  var refreshTrendsRate = 2 * 60000;

  var woeid = 1; // TT location id: 1 = location worldwide, 23424768 = BR

  var lastTrends = [];
  var lastUpdateDate = new Date();

  var io = require('socket.io').listen(server);

  io.on('connection', function (socket) {
      // When the user connect, send updated data
      socket.on('update-me', function() {
        io.emit('update', lastTrends);
        io.emit('update-date', lastUpdateDate);
      });
  });

  setInterval(function(){

    saveTrendingTopics();

  }, refreshTrendsRate);

  saveTrendingTopics();



  function sendListToUser(){

    // Get most recent list of TTs
    TrendsModel.findOne({}, {}, { sort: { 'created_at' : -1 } }, function(err, docsTrends) {

      if (err) {
        console.log(JSON.stringify(err));
        throw err;
      }

      var lastUpdateDate = docsTrends.created_at;

      // Get historical data of every TT ---------------------------------------
      var trendsToCompute = docsTrends.trends.length;
      var listTrends = [];
      var i = 0;

      for(var key in docsTrends.trends) {

        StockModel.find({ 'name': docsTrends.trends[key].name })
                  .sort('-created_at')
                  .limit(config.maxStockChartData)
                  .exec(function (err, docsStocks) {

          // Must have at least 1 rows of data
          if (docsStocks.length){

              var currentPrice = parseInt(docsStocks[0].price || 0);
              if (currentPrice > 0) {

                listTrends[i] = {
                  'name' : docsStocks[0].name,
                  'count' : currentPrice,
                }

                // Price history -------------------------------------------------
                var priceHistory = [];
                for (var i2 = 0; i2 < docsStocks.length; i2++) {
                    if (docsStocks[i2].price != null) {
                      priceHistory.push({
                        'count' : docsStocks[i2].price,
                        'created' : docsStocks[i2].created_at
                      });  
                    }
                }
                listTrends[i].history = priceHistory;
                // ---------------------------------------------------------------
                i++;
              }
          }

          trendsToCompute--;
          if (trendsToCompute == 0){
              console.log("The complete list: ");
              console.log(JSON.stringify(listTrends));
              lastTrends = JSON.parse(JSON.stringify(listTrends));
              io.emit('update', lastTrends);
              io.emit('update-date', lastUpdateDate);
          }

        });

      }

      // -----------------------------------------------------------------------

    });

  }


  var createStockFromTrend = function(trend, created_at, callback) {

    StockModel.find({ 'name': trend.name })
              .sort('-created_at')
              .limit(1)
              .exec(function (err, prevStock) {

      if (err) { console.log(JSON.stringify(err)); }

      // Calculate stock price
      var stockPrice = null;
      var prevStockPrice = null;

      if (prevStock.length){
        stockPrice = parseInt(trend.tweet_volume) - parseInt(prevStock[0].tweet_volume);
        prevStockPrice = prevStock[0].price
      }

      if ((prevStockPrice != stockPrice ) || !prevStock.length) {
        // Price did update or it's the first document

        // Save Trend as Stock
        var newStockModel = new StockModel({
            name: trend.name,
            price: stockPrice,
            created_at: created_at,
            tweet_volume: parseInt(trend.tweet_volume)
        });

        newStockModel.save(function(err, newStockModel) {
          callback(newStockModel);
        });

      }
      else{ callback(newStockModel); }

    });
  }


  function saveTrendingTopics(){

    // Trends location: Yahoo's Where On Earth Id
    // https://developer.yahoo.com/geo/geoplanet/
    clientTwitter.get('trends/place', { 'id' : woeid },
      function(error, result, response) {
        if(error) {
          console.error(JSON.stringify(error));
          throw error;
        }

        // Check if same Trends was already fetched
        TrendsModel.find({ 'created_at': result[0].created_at }, function (err, docs) {

          if(err) console.error(err);

          // No recent updates. Get new list!
          if(!docs.length){

            // Save new Trends
            var newTrends = new TrendsModel(result[0]);
            newTrends.save(function(err, newTrends) {

              if(err) console.error(err);

              // For each Trend, save Counts -----------------------------------
              var trendsToCompute = newTrends.trends.length;

              for(var key in newTrends.trends) {

                var stock = newTrends.trends[key];

                // Some Trends don't have tweet_volume. Ignore them.
                var stockVolume = parseInt(stock.tweet_volume) || 0;
                if (stock.name && stockVolume !== 0) {

                  createStockFromTrend(stock, newTrends.created_at, function(newStockModel){
                    trendsToCompute--;
                    if (trendsToCompute == 0) { sendListToUser(); }
                  });

                }
                else{
                  trendsToCompute--;
                  if (trendsToCompute == 0) { sendListToUser(); }
                }

              }
              // ---------------------------------------------------------------

            });

          }

        });

      });

  }

};
