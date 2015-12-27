'use strict';

// List of Trending Topics

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Trends Model
// Follow this pattern: https://dev.twitter.com/rest/reference/get/trends/place
var trendsSchema = new Schema({
  as_of: Date,
  created_at: Date,
  locations: [mongoose.Schema.Types.Mixed],
  trends: [mongoose.Schema.Types.Mixed],
});


/**
 * Statics
 */
trendsSchema.statics = {
  getNewestStoredTT: function(cb){
    this.findOne()
      .sort('-created_at')
      .exec(cb);
  },
};

// create the model for users and expose it to our app
module.exports = mongoose.model('Trends', trendsSchema);
