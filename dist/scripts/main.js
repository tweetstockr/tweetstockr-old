(function() {
  'use strict';

  angular
    .module('tweetstockr', ['ngRoute'])
    .config(["$routeProvider", "$locationProvider", function ($routeProvider, $locationProvider) {
      $routeProvider

      .when('/dashboard', {
        templateUrl: 'partials/dashboard.html',
        controller: 'dashboardController'
      })

      .when('/market', {
        templateUrl: 'partials/market.html',
        controller: 'marketController'
      })

      .when('/wallet', {
        templateUrl: 'partials/wallet.html',
        controller: 'walletController'
      })

      .when('/shop', {
        templateUrl: 'partials/shop.html',
        controller: 'shopController'
      })

      .when('/ranking', {
        templateUrl: 'partials/ranking.html',
        controller: 'rankingController'
      })

      .when('/profile', {
        templateUrl: 'partials/profile.html',
        controller: 'profileController'
      })

      .otherwise({
        redirectTo: '/dashboard'
      });
    }]);
})();
(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('dashboardController', dashboardController);

  function dashboardController () {
    
  }
})();
(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('marketController', marketController);

  function marketController () {
    
  }
})();
(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('profileController', profileController);

  function profileController () {
    
  }
})();
(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('rankingController', rankingController);

  function rankingController () {
    
  }
})();
(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('shopController', shopController);

  function shopController () {
    
  }
})();
(function() {
  'use strict';

  angular
    .module('tweetstockr')
    .controller('walletController', walletController);

  function walletController () {
    
  }
})();