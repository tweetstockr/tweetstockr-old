/*
 *  Gets the updated Trending Topics list from Twitter
 *  Twitter limits the search in 15 minutes intervals
 */

var TrendsModel  = require('./models/trends');
var configAuth  = require('./config/credentials');
var twitter     = require('twitter');

var refreshTrendsRate = 15 * 60000; // Interval to wait before update Trends list
var woeid = 1; // TT location id: 1 = location worldwide, 23424768 = BR


  var clientTwitter = new twitter({
        consumer_key        : configAuth.twitterAuth.consumerKey,
        consumer_secret     : configAuth.twitterAuth.consumerSecret,
        access_token_key    : configAuth.twitterAuth.accessTokenKey,
        access_token_secret : configAuth.twitterAuth.accessTokenSecret,
      });

  // Updates the Trending Topics list
  exports.updateTrendsList = function() {

    // It can only be called once in [refreshTrendsRate] due to Twitter API limitation
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
