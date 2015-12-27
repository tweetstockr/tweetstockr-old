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

/**
 * Statics
 */
stockSchema.statics = {
  getNewestByName: function(stockName, cb) {
    this.findOne({name:stockName})
      .sort({created_at:-1})
      .exec(cb);
  },
  getLastPrices: function(stockName, cb) {
    this.find({name:stockName})
      .sort({created_at:-1})
      .limit(config.maxStockChartData)
      .exec(cb);
  }
};

// create the model for users and expose it to our app
module.exports = mongoose.model('Stock', stockSchema);
