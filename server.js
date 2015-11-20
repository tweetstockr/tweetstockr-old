'use strict';

var cluster = require('cluster');
if (cluster.isMaster) {
  cluster.fork();

  cluster.on('exit', function(worker, code, signal) {
    cluster.fork();
  });
}

if (cluster.isWorker) {

  var express = require('express');
  var app = express();
  var bodyParser = require('body-parser');
  var mongoose = require('mongoose');
  var passport = require('passport');

  var flash = require('connect-flash');
  var cookieParser = require('cookie-parser');
  var session = require('express-session')({
                    secret: 'sweet home office',
                    saveUninitialized: true,
                    resave: false });
  var morgan       = require('morgan');
  var config = require('./server/config/config');

  var server = require('http').createServer(app);



  require('./server/config/passport')(passport);

  app.set('views', __dirname + '/client/views');
  app.set('view engine', 'jade');

  mongoose.connect(config.db);

  app.use(morgan('dev')); // log every request to the console
  app.use(cookieParser());

  app.use(bodyParser.json());
  app.use(session);
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash()); /* Send messages to the client */

  app.use('/scripts', express.static(__dirname + '/dist/scripts'));
  app.use('/stylesheets', express.static(__dirname + '/dist/stylesheets'));
  app.use('/bower', express.static(__dirname + '/bower_components'));
  app.use('/images', express.static(__dirname + '/client/images'));

  // ROUTES
  require('./server/routes')(app, passport);

  // ROBOT
  var http  = require('http').createServer(app);
  var tweetOmeter = require('./server/twitterController')(server);

  server.listen(process.env.PORT || config.port, function(){
    console.log('aeeeee...');
  });

}
