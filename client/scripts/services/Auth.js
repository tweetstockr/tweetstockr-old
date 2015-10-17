(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .factory('Auth', Auth);

  function Auth($location, $rootScope, $cookies, $resource, User, Session) {
    $rootScope.currentUser = angular.fromJson($cookies.get('user')) || null;
    $cookies.remove('user');

    return {
      currentUser: function() {
        Session.get(function(user){
          $rootScope.currentUser = user;
        });
      },

      createUser: function(userinfo, callback) {
        var cb = callback || angular.noop;

        User.save(userinfo,
          function(user) {
            $rootScope.currentUser = user;
            return cb();
          },
          function(err) {
            return cb(err.data);
          });
      },

      login: function(provider, user, callback) {
        var cb = callback || angular.noop;

        // Create sessions
        Session.save({
          provider: provider,
          username: user.username,
          password: user.password,
          rememberMe: user.rememberMe
        },function(user) {
          $rootScope.currentUser = user;
          return cb();
        }, function(err) {
          return cb(err.data);
        });
      },

      changePassword: function(email, oldPassword, newPassword, callback) {
        var cb = callback || angular.noop;

        User.update({
          email: email,
          oldPassword: oldPassword,
          newPassword: newPassword
        }, function() {
          console.log('password changed');
          return cb();
        }, function(err) {
          return cb(err.data);
        });
      },

      logout: function(callback) {
        var cb = callback || angular.noop;

        Session.delete(function() {
          $rootScope.currentUser = null;
          return cb();
        },
        function(err) {
          return cb(err.data);
        });
      },
    };
  }
})();
