'use strict';

var shareController = require('../server/controllers/shareController');
var userController = require('../server/controllers/userController');
var path = require('path');
var auth = require('./config/auth');

module.exports = function(app, passport) {

  // User Routes
  app.get('/auth/user/:userId', userController.show);
  app.get('/api/ranking', userController.ranking);

  // Twitter auth
  app.get('/auth/twitter',
    passport.authenticate('twitter'));

  app.get('/auth/twitter/callback',
    passport.authenticate('twitter', { failureRedirect: '/login' }),
    function(req, res) {
      // Successful authentication, redirect home.
      res.redirect('/');
    });

  app.post('/auth/reset', userController.reset);

  // User Portfolio
  app.get('/api/portfolio', shareController.byOwner);
  // Shares
  app.get('/api/shares', shareController.all);
  app.post('/api/shares', auth.ensureAuthenticated, shareController.create);
  app.get('/api/shares/:shareId', shareController.show);
  app.put('/api/shares/:shareId', auth.ensureAuthenticated, auth.share.hasAuthorization, shareController.update);
  app.delete('/api/shares/:shareId', auth.ensureAuthenticated, auth.share.hasAuthorization, shareController.destroy);

  //Setting up the shareId param
  app.param('shareId', shareController.share);

  app.get('/partials/*', function(req, res) {
    var requestedView = path.join('./', req.url);
    var username = req.user ? req.user.username : '';

    res.render(requestedView, {
      error: req.flash('error'),
      info: req.flash('info'),
      username: username
    });
  });

  app.get('/shared/*', function(req, res) {
    var requestedView = path.join('./', req.url);
    var username = req.user ? req.user.username : '';
    res.render(requestedView, {
      username: username
    });
  });

  app.get('/profile', auth.ensureAuthenticated, function(req, res) {
    res.render('index');
  });

  app.get('/logout', function(req, res) {
    req.session.destroy();
    req.logout();
    res.redirect('/');
  });

  app.get('/*', function(req, res) {
    if(req.user) {
      res.cookie('user', JSON.stringify(req.user.user_info));
    }

    res.render('index');
  });
};
