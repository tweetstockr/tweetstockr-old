/*
 *  twitterTrendingTopics.js
 *
 *  Gets the updated Trending Topics list from Twitter
 *  Twitter limits the search in 5 minutes intervals
 *
 */

var TrendsModel = require('./models/trends');
var configAuth  = require('./config/credentials');

var refreshTrendsRate = 5 * 60000; // Interval to wait before update Trends list
var woeid = 1; // TT location id: 1 = location worldwide, 23424768 = BR


var clientTwitter = new require('twitter')({
      consumer_key        : configAuth.twitterAuth.consumerKey,
      consumer_secret     : configAuth.twitterAuth.consumerSecret,
      access_token_key    : configAuth.twitterAuth.accessTokenKey,
      access_token_secret : configAuth.twitterAuth.accessTokenSecret,
    });

// Updates the Trending Topics list
exports.getUpdatedTrendsList = function(cb) {

  // It can only be called once in [refreshTrendsRate] due to Twitter API limitation
  var nowMinusRequestLimitMinutes = new Date(new Date() - refreshTrendsRate);

  TrendsModel.find(
    { 'created' : { '$gte' : nowMinusRequestLimitMinutes, '$lt' : new Date() } },
    function (err, results) {

      if(err) return console.error(err);

      // No update in the last 5 minutes, so... update it!
      if(!results.length) {

        // Trends location: Yahoo's Where On Earth Id
        // https://developer.yahoo.com/geo/geoplanet/
        clientTwitter.get('trends/place', { 'id' : woeid },
          function(error, result, response) {
            if(error) throw error;

            //Store trends on database
            var newTrends = new TrendsModel({
              woeid : woeid,
              list : result[0].trends,
            });

            newTrends.save(function(err, newTrends) {

              // Trends list updated!
              console.log('-- TTs list fetched from Twitter: ' + JSON.stringify(newTrends));
              cb(err, newTrends);

            });

          });
      }
      // Updated on the las 5 minutes, get last one from mongo
      else{

        TrendsModel.getNewestStoredTT(function(err, trends) {

          console.log('-- TTs list fetched from Mongo: ' + JSON.stringify(trends));
          cb(err, trends);

        });

      }

    }
  );

}
