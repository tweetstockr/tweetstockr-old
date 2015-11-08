'use strict';

// List of Trending Topics

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var StockModel   = require('./stock');

// Trends Model
var trendsSchema = new Schema({
  woeid : Number,
  list : [mongoose.Schema.Types.Mixed],
  created: Date
});

/**
 * Pre hook.
 */
trendsSchema.pre('save', function(next, done){
  if (this.isNew) {
    this.created = Date.now();
  }

  next();
});

/**
 * Statics
 */
trendsSchema.statics = {
  load: function(id, cb) {
    this.findOne({
      _id: id
    }).populate('owner', 'username').exec(cb);
  },
  getNewestStoredTT: function(cb){
    this.findOne()
      .sort('-created')
      .exec(cb);
  },
};

// create the model for users and expose it to our app
module.exports = mongoose.model('Trends', trendsSchema);
