'use strict';

var UserModel = require('../models/user');
var ShareModel = require('../models/share');
var config = require('../config/config');

/**
 *  Show profile
 *  returns {username, profile}
 */
exports.show = function (req, res, next) {
  var userId = req.params.userId;

  ModelUser.findById(ObjectId(userId), function (err, user) {
    if(err) {
      return next(new Error('Failed to load User'));
    }

    if(user) {
      res.send({username: user.username, profile: user.profile });
    } else {
      res.send(404, 'USER_NOT_FOUND');
    }
  });

};

/**
 * Find list of users
 * order by points
 * remove secret fields
 */
exports.ranking = function(req, res) {
  UserModel
    .find({},{
      '_id': 0,
    })
    .limit(config.usersOnRanking)
    .sort('-points')
    .exec(function(err, users) {
      if(err) {
        res.status(500).json(err);
      } else {
        res.json(users);
      }
    });
};



/**
 * Reset user points to default
 * Remove all shares
 */
exports.reset = function(req, res){

  // Reset user points
  UserModel.findOneAndUpdate(
     { _id : req.user._id },
     { points : config.startingPoints },
     {upsert:true},function(err, user) {
       if (err) {
         res.status(500).json(err);
       } else {

          // Remove Shares
          ShareModel.find({owner:user._id}).remove().exec(function(err) {
            if (err){ req.flash('error', err); }
            else{
              req.flash('info', 'Welcome back to the game, ' + user.twitter.username + '!');
            }
            res.json(user.user_info);
          });

       }
  });

}
