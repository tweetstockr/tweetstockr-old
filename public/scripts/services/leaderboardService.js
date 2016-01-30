(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .factory('leaderboardService', leaderboardService);

  function leaderboardService () {
    var leaderboard = [
      {
          "name": "Taylor Gordon"
        , "user_photo": "https://i.vimeocdn.com/portrait/3471430_300x300.jpg"
        , "user_points": 1635
      },

      {
          "name": "Sherri Ryan"
        , "user_photo": "https://secure.gravatar.com/avatar/3e1b4c0646f5679a31b4fcd992f64b10?d=https%3A%2F%2Fi.vimeocdn.com%2Fportrait%2Fdefault-green_300x300.png&s=300"
        , "user_points": 5368
      },

      {
          "name": "Owen Welch"
        , "user_photo": "https://i.vimeocdn.com/portrait/10991843_300x300.jpg"
        , "user_points": 7323
      },

      {
          "name": "Brad Roberts"
        , "user_photo": "https://i.vimeocdn.com/portrait/4900311_300x300.jpg"
        , "user_points": 1226
      },

      {
          "name": "Martin Schnitzer"
        , "user_photo": "https://s3.amazonaws.com/ideo-org-images-production/fellow_avatars/127/original/Martin-Schnitzer-Portrait.jpg"
        , "user_points": 3847
        , "me": true
      },

      {
          "name": "Minnie Bredouw"
        , "user_photo": "https://s3.amazonaws.com/ideo-org-images-production/fellow_avatars/123/original/Minnie-Bredouw-Portrait.jpg"
        , "user_points": 8495
      },

      {
          "name": "Allie Avital"
        , "user_photo": "https://i.vimeocdn.com/portrait/10428575_300x300.jpg"
        , "user_points": 7374
      },

      {
          "name": "Brad Roberts"
        , "user_photo": "https://i.vimeocdn.com/portrait/4900311_300x300.jpg"
        , "user_points": 4902
      },

      {
          "name": "Nikolas Woischnik"
        , "user_photo": "http://www.heisenbergmedia.com/wp-content/uploads/2015/06/Nikolas-Woischnik-Image-by-Dan-Taylor-dan@heisenbergmedia.com-1-1.jpg?15ba49"
        , "user_points": 2349
      }
    ];

    return {
      getUser: function () {
        return leaderboard;
      }
    }
  }
})();