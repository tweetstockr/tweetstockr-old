/*
 *  twitterController.js
 *
 *  Turns the streaming on
 *  After 1 minute of streaming, restart it
 *
 */

'use strict';

var refreshTweetsCountRate = 60000; // Interval to wait before update Tweets count
var TwitterStream = require('./twitterStream');

module.exports = function(server) {

  var twitterStream = new TwitterStream(server);

  twitterStream.resetTwitterStream();
  twitterStream.sendListToClient();
  twitterStream.startTwitterStream();

  // Get counted Tweets and store in the database
  var tweetCounter = setInterval(function() {

    console.log('-- Stop counting and start streaming again!');
    twitterStream.resetTwitterStream();
    twitterStream.sendListToClient();

  }, refreshTweetsCountRate);

};
