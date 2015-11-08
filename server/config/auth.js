'use strict';

/**
 *  Route middleware to ensure user is authenticated.
 */
exports.ensureAuthenticated = function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.sendStatus(401);
};

/**
 * Blog authorizations routing middleware
 */
exports.share = {
  hasAuthorization: function(req, res, next) {
    if (req.share.owner._id.toString() !== req.user._id.toString()) {
      return res.sendStatus(403);
    }

    next();
  }
};
