'use strict';

var nodemailer  = require('nodemailer');
var configAuth  = require('./credentials');

module.exports.send = function(options, callback) {
  var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: configAuth.gmailAuth
  });

  var mailOptions = {
    from    : options.from || 'Tweetstockr <playtweetstockr@gmail.com>',
    to      : options.recipient,
    subject : options.subject || 'Hello from Tweetstockr',
    text    : options.text,
    html    : options.html,
  };

  transporter.sendMail(mailOptions, function(error, info){
    return callback(error, info) || !error;
  });
};
