'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  twitter          : {
    id           : String,
    token        : String,
    displayName  : String,
    username     : String,
    profile_image:String,
    profile_image_normal:String
  },
  points: {
    type: Number,
    get: parsePoints
  },
  created: Date
});

function parsePoints (p) {
  return parseInt(p) || 0;
}

/* Virtuals */
UserSchema.virtual('user_info')
  .get(function () {
    return {
      '_id': this._id,
      'username': this.twitter.username,
      'name': this.twitter.displayName,
      'points': this.points,
      'picture': this.twitter.profile_image,
      'picture_thumb': this.twitter.profile_image_normal,  
    };
  });

module.exports = mongoose.model('User', UserSchema);
