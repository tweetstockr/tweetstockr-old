'use strict';

var TwitterStrategy = require('passport-twitter').Strategy;
var UserModel     = require('../models/user');
var credentials = require('./credentials');
var config = require('./config');

module.exports = function(passport) {
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    UserModel.findById(id, function(err, user) {
      done(err, user);
    });
  });

  passport.use(new TwitterStrategy({
    consumerKey: credentials.twitterAuth.consumerKey,
    consumerSecret: credentials.twitterAuth.consumerSecret,
    callbackURL: credentials.twitterAuth.callbackURL
  },
  function(token, tokenSecret, profile, done) {

    process.nextTick(function() {
      UserModel.findOne({
        'twitter.id' : profile.id
      }, function(err, user) {
        // if there is an error, stop everything and return that
        // ie an error connecting to the database
        if(err) {
          return done(err);
        }

        // if the user is found then log them in
        if(user) {
          return done(null, user); // user found, return that user
        } else {
          // if there is no user, create them
          var newUser                 = new UserModel();

          // set all of the user data that we need
          newUser.twitter.id          = profile.id;
          newUser.twitter.token       = token;
          newUser.twitter.username    = profile.username;
          newUser.twitter.displayName = profile.displayName;
          newUser.twitter.profile_image_normal = profile._json.profile_image_url;
          newUser.twitter.profile_image = profile._json.profile_image_url.replace('_normal','');
          newUser.points              = config.startingPoints;

          // save our user into the database
          newUser.save(function(err) {
            if(err) {
              throw err;
            }

            return done(null, newUser);
          });
        }
      });
    });
  }));
};
