// var twitter = require('../../config.js');

module.exports = {
  'twitterAuth' : {
    'consumerKey'       : process.env.TWITTER_CONSUMER_KEY || twitter.consumerKey,
    'consumerSecret'    : process.env.TWITTER_CONSUMER_SECRET || twitter.consumerSecret,
    'accessTokenKey'    : process.env.TWITTER_TOKEN_KEY || twitter.accessTokenKey,
    'accessTokenSecret' : process.env.TWITTER_TOKEN_SECRET || twitter.accessTokenSecret,
    'callbackURL'       : process.env.TWITTER_CALLBACK_URL || twitter.callbackURL
  }
};
