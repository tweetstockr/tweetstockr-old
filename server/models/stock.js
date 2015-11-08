'use strict';

// This is the Stock itself
// One trending topic is one Stock

// eg.
// name: #CalaBocaVoceVotouNaDilma
// price: 829
// date: Wed Sep 23 2015 09:37:38 GMT-0300 (BRT)

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
  created: Date
});

/**
 * Pre hook.
 */
stockSchema.pre('save', function(next, done){
  if (this.isNew) {
    this.created = Date.now();
  }

  next();
});

/**
 * Statics
 */
stockSchema.statics = {
  getNewestByName: function(stockName, cb) {
    this.findOne({name:stockName})
      .sort({created:-1})
      .exec(cb);
  },
  getLastPrices: function(stockName, cb) {
    this.find({name:stockName})
      .sort({created:-1})
      .limit(config.maxStockChartData)
      .exec(cb);
  }
};

// create the model for users and expose it to our app
module.exports = mongoose.model('Stock', stockSchema);
