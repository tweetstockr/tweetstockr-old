'use strict';

var ShareModel  = require('../models/share');
var TrendsModel = require('../models/trends');
var StockModel  = require('../models/stock');
var UserModel   = require('../models/user');
var strings     = require('../config/strings');
var config = require('../config/config');

function errorMessage(msg) {
  return { success : false, message : msg };
}

/**
 * Find share by id
 */
exports.share = function(req, res, next, id) {
  ShareModel.load(id, function(err, share) {
    if(err) {
      return next(err);
    }

    if(!share) {
      return next(new Error(
        strings.failed_to_load_share_x.format(id)
      ));
    }

    req.share = share;
    next();
  });
};

/**
 * Create a share (buy a TT)
 */
exports.create = function(req, res) {
  var share = new ShareModel(req.body);
  var quantity = share.amount; //quantity to buy
  var stockName = share.stock;

  share.owner = req.user; //who bought this?

  // Check if the TT is on the most recent TT list
  TrendsModel.findOne({}, {}, { sort: { 'created_at' : -1 } }, function(err, docsTrends) {
    if(err) {
      return console.error(err);
    }

    // Check if we have a TT list
    if(!docsTrends) {
      return res.json(errorMessage(
        strings.tt_not_available
      ));
    }

    // Search for stockName in the current TT list
    var found = false;

    for (var i = 0; i < docsTrends.trends.length; i++) {
      if(docsTrends.trends[i].name === stockName) {
        found = true; break;
      }
    }

    // stockName was not found in TTs list
    if(!found) {
      return res.json(errorMessage(
        strings.x_not_tt_anymore.format(stockName)
      ));
    }

    // Found stock in TTs list
    // Get last computed stock
    StockModel.find({ 'name': stockName })
              .sort('-created_at')
              .limit(config.maxStockChartData)
              .exec(function (err, docsStocks) {

      if(err) {
        return console.error(err);
      }

      if(!docsStocks) {
        var message = strings.x_not_valid;
        if (message){message.format(stockName)}
        return res.json(errorMessage(message));
      }

      // Calculate price -------------------------------------------------------
      var price = 0;
      if (docsStocks.length){
        price = docsStocks[0].price;
      }
      var totalPrice = (price * quantity);
      // -----------------------------------------------------------------------

      // Total price can't be zero
      if(totalPrice <= 0) {
        return res.json(errorMessage(
          strings.invalid_price
        ));
      }
      if(share.owner.points < totalPrice) {
        return res.json(errorMessage(
          strings.not_enough_points
        ));
      }

      share.price = price;

      share.save(function(err) {
        if(err) {
          res.status(500).json(err);
        } else {

          // Current user balance
          var newBalance = share.owner.points - totalPrice;
          newBalance = +newBalance.toFixed(2);

          // Share created for the user
          // after buying the stock, remove points from user
          UserModel.findOneAndUpdate(
            { _id : share.owner._id },
            { points : newBalance },
            { upsert:true}, function(err) {
              if(err) {
                res.status(500).json(err);
              } else {
                // get updated user
                UserModel.findOne({_id:share.owner._id},
                  function(err, updatedUser) {
                    var shareReturn = JSON.parse(JSON.stringify(share));
                    shareReturn.owner = updatedUser.user_info;
                    res.json(shareReturn);
                });
              }
            });
        }
      });
    });
  });
};

/**
 * Update a share
 */
exports.update = function(req, res) {
  var share = req.share;

  share.stock = req.body.stock;
  share.amount = req.body.amount;
  share.save(function(err) {
    if(err) {
      res.status(500).json(err);
    } else {
      res.json(share);
    }
  });
};


/**
 * Delete a share
 */
exports.destroy = function(req, res) {
  var share = req.share;

  share.owner = req.user; //who bought this?

  share.remove(function(err) {
    if(err) {
      res.status(500).json(err);
    } else {

      // Get last computed stock
      StockModel.find({ 'name': share.stock })
                .sort('-created_at')
                .limit(1)
                .exec(function (err, stock) {

        // Update price of stock is stock.price
        // If stock not found. delete anyway

        if(!stock) {
          res.json(share);
        } else if (!stock.length) {
          res.json(share);
        } else {

          var currentPrice = (stock[0].price * share.amount);
          //after removing the stock, give the points to the user

          // Current user share.owner has share.owner.points points
          UserModel.findOneAndUpdate(
            { _id : share.owner._id },
            { points : share.owner.points + currentPrice },
            {upsert:true},
              function(err) {
                if(err) {
                  res.status(500).json(err);
                } else {
                  // get updated user
                  UserModel.findOne({_id:share.owner._id},
                    function(err, updatedUser) {
                      // User updated
                      var shareReturn = JSON.parse(JSON.stringify(share));
                      shareReturn.owner = updatedUser.user_info;
                      res.json(shareReturn);
                  });
                }
          });
        }
      });
    }
  });
};

/**
 * Show a share
 */
exports.show = function(req, res) {
  res.json(req.share);
};

/**
 * List of ShareModels
 */
exports.all = function(req, res) {
  ShareModel
    .find()
    .sort('-created')
    .populate('owner', 'username')
    .exec(function(err, shares) {
      if(err) {
        res.status(500).json(err);
      } else {
        res.json(shares);
      }
    });
};

exports.byOwner = function(req, res) {
  ShareModel
    .find({owner:req.user._id})
    .sort('-created').populate('owner', 'username')
    .exec(function(err, shares) {
      if(err) {
        res.status(500).json(err);
      } else {
        // this will make sure every stock has it's price even async
        var portfolio = [];
        var sharesToUpdate = shares.length;

        if(sharesToUpdate === 0) {
          res.json(portfolio);
        }

        shares.forEach(function( share ) {
          // get most recent count
          StockModel.find({ 'name': share.stock })
                    .sort('-created_at')
                    .limit(1)
                    .exec(function (err, stock) {

              var price = 0;

              if(stock.length) {
                price = stock[0].price;
              }

              portfolio.push({
                '_id' : share._id,
                'stock' : share.stock,
                'amount' : share.amount,
                'purchasePrice' : share.price,
                'currentPrice' : price,
                'currentPriceTotal' : price * share.amount,
                'created' : share.created,
                'owner' : share.owner.user_info,
              });

              sharesToUpdate--;

              if(sharesToUpdate === 0) {
                res.json(portfolio);
              }
            });
        });
      }
  });
};
