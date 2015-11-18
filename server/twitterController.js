/*
 *  twitterController.js
 *
 *  Turns the streaming on
 *  After 1 minute of streaming, restart it
 *
 */

'use strict';

var refreshTweetsCountRate = 60000; // Interval to wait before update Tweets count

var twitterTrendingTopics = require('./twitterTrendingTopics');
var TwitterStream = require('./twitterStream');

module.exports = function(server) {
  
  var twitterStream = new TwitterStream(server);

  twitterStream.resetTwitterStream();
  twitterStream.startTwitterStream();
  twitterStream.sendListToClient();

  // Get counted Tweets and store in the database
  var tweetCounter = setInterval(function() {
    // Stop Counting!
    console.log('-- Stop counting!');
    twitterStream.resetTwitterStream();
    twitterStream.sendListToClient();


    twitterTrendingTopics.updateTrendsList();
  }, refreshTweetsCountRate);
};
