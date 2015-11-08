'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ShareSchema = new Schema({
  stock: {
    type: String,
    index: true,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    default: 1
  },
  price: {
    type: Number,
    default: 0
  },
  owner: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  created: Date
});

/**
 * Pre hook.
 */

ShareSchema.pre('save', function(next, done){
  if (this.isNew) {
    this.created = Date.now();
  }

  next();
});

/**
 * Statics
 */
ShareSchema.statics = {
  load: function(id, cb) {
    this.findOne({
      _id: id
    }).populate('owner', 'username').exec(cb);
  }
};

module.exports = mongoose.model('Share', ShareSchema);
