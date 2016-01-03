'use strict';

// This is the Stock itself
// One trending topic is one Stock


var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../config/config');

// Stock Model
var stockSchema = new Schema({
  name: {
    type: String
  },
  price: {
    type: Number
  },
  tweet_volume: {
    type: Number
  },
  created_at: Date
});

/**
 * Pre hook.
 */
stockSchema.pre('save', function(next, done){
  if (this.isNew) {
    this.created_at = Date.now();
  }

  next();
});



// create the model for users and expose it to our app
module.exports = mongoose.model('Stock', stockSchema);
