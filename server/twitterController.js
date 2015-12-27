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

// Interval to wait before update Trends list
// From Twitter: "This information is cached for 5 minutes.
// Requesting more frequently than that will not return any more
// data, and will count against your rate limit usage."
// There are two initial buckets available for GET requests:
// 15 calls every 15 minutes, and 180 calls every 15 minutes.

var refreshTrendsRate = 2 * 60000;

var woeid = 1; // TT location id: 1 = location worldwide, 23424768 = BR

var lastTrends = [];
var lastUpdateDate = new Date();

var clientTwitter = new require('twitter')({
      consumer_key        : configAuth.twitterAuth.consumerKey,
      consumer_secret     : configAuth.twitterAuth.consumerSecret,
      access_token_key    : configAuth.twitterAuth.accessTokenKey,
      access_token_secret : configAuth.twitterAuth.accessTokenSecret,
    });

module.exports = function(server) {

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

      if(err) throw err;

      var lastUpdateDate = docsTrends.created_at;

      // Get historical data of every TT ---------------------------------------
      var totalTrends = docsTrends.trends.length;
      var listTrends = [];
      var i = 0;

      for(var key in docsTrends.trends) {
        StockModel.find({ 'name': docsTrends.trends[key].name })
                  .sort('-created_at')
                  .limit(config.maxStockChartData)
                  .exec(function (err, docsStocks) {

          totalTrends--;

          // Must have at least 1 rows of data to calculate price
          if (docsStocks.length){
            listTrends[i] = {
              'name' : docsStocks[0].name,
              'count' : docsStocks[0].price,
            }

            // Price history ---------------------------------------------------
            var priceHistory = [];
            for (var i2 = 0; i2 < docsStocks.length; i2++) {
                priceHistory.push({
                  'count' : docsStocks[i2].price,
                  'created' : docsStocks[i2].created_at
                });
            }
            listTrends[i].history = priceHistory;
            // -----------------------------------------------------------------

            i++;
          }

          if (totalTrends == 0){
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

            // Save Trends
            var newTrends = new TrendsModel(result[0]);
            newTrends.save(function(err, newTrends) {

              if(err) console.error(err);

              // For each Trend, save Counts -----------------------------------
              var trendsToCompute = newTrends.trends.length;

              var totalTweets = 0;
              for(var key in newTrends.trends) {
                totalTweets += parseInt(newTrends.trends[key].tweet_volume) || 0;
              }
              console.log("totalTweets:" + totalTweets);

              for(var key in newTrends.trends) {

                var stock = newTrends.trends[key];

                // Some Trends don't have tweet_volume. Ignore them.
                if (stock.name && stock.tweet_volume) {

                  var stockPrice = parseInt(stock.tweet_volume) || 0;

                  // Save Counts
                  var newStockModel = new StockModel({
                      name: stock.name,
                      price: (stockPrice/totalTweets)*100,
                      created_at: newTrends.created_at
                  });

                  newStockModel.save(function(err, newStockModel) {
                    if(err) console.error(err);
                  });
                }

                  sendListToUser();

              }
              // ---------------------------------------------------------------

            });

          }


        });

      });

  }

};
