(function() {
  'use strict';

  angular
    .module('tweetstockr', [
      'ngResource',
      'ngRoute',
      'ngCookies',
      'angular-chartist'
    ])
    .config(function($routeProvider, $locationProvider) {
      $routeProvider
      .when('/home', {
        templateUrl: 'partials/home',
        controller: 'homeController'
      })

      .when('/about', {
        templateUrl: 'partials/about',
        controller: 'aboutController'
      })

      .when('/signup', {
        templateUrl: 'partials/signup',
        controller: 'signupController'
      })

      .when('/login', {
        templateUrl: 'partials/login',
        controller: 'loginController'
      })

      .when('/profile', {
        templateUrl: 'partials/profile',
        controller: 'profileController'
      })

      .when('/ranking', {
        templateUrl: 'partials/ranking',
        controller: 'rankingController'
      })

      .when('/forgot', {
        templateUrl: 'partials/forgot',
        controller: 'forgotPasswordController'
      })

      .otherwise({
        redirectTo: '/home'
      });

      $locationProvider.html5Mode(true);
    })

    .directive('navbar', function () {
      return {
        restrict: 'E',
        templateUrl: 'shared/navbar'
      };
    })

    .run(function ($rootScope, $location, Auth) {
      //watching the value of the currentUser variable.
      $rootScope.$watch('currentUser', function(currentUser) {
        var visitorAllowedPaths = [
          '/',
          '/home',
          '/login',
          '/logout',
          '/signup',
          '/ranking',
          '/about'
        ];

        // if no currentUser and on a page that requires authorization then try to update it
        // will trigger 401s if user does not have a valid session
        if (!currentUser && (visitorAllowedPaths.indexOf($location.path()) === -1 )) {
          Auth.currentUser();
        }
      });

      // On catching 401 errors, redirect to the login page.
      $rootScope.$on('event:auth-loginRequired', function() {
        $location.path('/login');
        return false;
      });
    });
})();
