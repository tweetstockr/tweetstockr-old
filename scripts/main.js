function countdown(t){return{restrict:"A",link:function(e,o,n){function r(t){return c=49>=t?"#f33155":74>=t?"#F4D35E":"#43c8c0"}var i,c,a=o[0].getContext("2d"),u=o[0].width/2,s=o[0].height/2,l=90,f=0*Math.PI,d=!1,p=function(t){a.clearRect(0,0,2*u,2*s);var e=.02*t;i=e*Math.PI,a.beginPath(),a.arc(u,s,l,f,i,d),a.lineWidth=15,a.strokeStyle=r(t),a.stroke()};e.$watch("nextUpdatePerc",function(){t(p(e.nextUpdatePerc),1)})}}}!function(){"use strict";angular.module("tweetstockr",["ngRoute","angular-chartist","ui-notification","ordinal"]).constant("CONFIG",{apiUrl:"http://api.tweetstockr.com"}).config(["$routeProvider","$locationProvider","NotificationProvider",function(t,e,o){t.when("/market",{templateUrl:"partials/market.html",controller:"marketController"}).when("/market/:tab",{templateUrl:"partials/market.html",controller:"marketController"}).when("/market/:tab",{templateUrl:"partials/market.html",controller:"marketController"}).when("/wallet",{templateUrl:"partials/wallet.html",controller:"walletController"}).when("/shop",{templateUrl:"partials/shop.html",controller:"shopController"}).when("/ranking",{templateUrl:"partials/ranking.html",controller:"rankingController"}).when("/tournaments",{templateUrl:"partials/tournaments.html",controller:"tournamentsController"}).when("/profile",{templateUrl:"partials/profile.html",controller:"profileController"}).otherwise({redirectTo:"/market"}),o.setOptions({delay:1e3,startTop:20,startRight:10,verticalSpacing:20,horizontalSpacing:20,positionX:"right",positionY:"top"})}])}(),function(){"use strict";function t(t,e){return{getRanking:function(o,n){e.get(t.apiUrl+"/ranking",function(t){o(t)},function(t){n(t)})}}}t.$inject=["CONFIG","networkService"],angular.module("tweetstockr").factory("leaderboardService",t)}(),function(){"use strict";function t(t,e,o){return{buy:function(n,r,i,c){o.postAuth(e.apiUrl+"/trade/buy",{stock:n,amount:r},function(e){t.updateCurrentUser(),i(e)},function(t){c(t)})},sell:function(n,r,i){o.postAuth(e.apiUrl+"/trade/sell",{trade:n},function(e){t.updateCurrentUser(),r(e)},function(t){i(t)})},getRound:function(t,n){o.get(e.apiUrl+"/round",function(e){t(e)},function(t){n(t)})}}}t.$inject=["$rootScope","CONFIG","networkService"],angular.module("tweetstockr").factory("marketService",t)}(),function(){"use strict";function t(t){return{postAuth:function(e,o,n,r){t({method:"POST",url:e,headers:{"Content-Type":"application/x-www-form-urlencoded"},transformRequest:function(t){var e=[];for(var o in t)e.push(encodeURIComponent(o)+"="+encodeURIComponent(t[o]));return e.join("&")},data:o,withCredentials:!0}).then(function(t){t.data.redirect_to&&(window.location=t.data.redirect_to),t.data.success?n(t.data):r(t.data||{message:"Sorry! An error ocurred."})},function(t){r({message:"Error: Could not connect to the server."}),console.log("Authenticated POST error: "+t)})},getAuth:function(e,o,n){t({method:"GET",url:e,withCredentials:!0}).then(function(t){t.data.redirect_to&&(window.location=t.data.redirect_to),o(t.data)},function(t){n({message:"Error: Could not connect to the server."}),console.log("Authenticated GET error: "+t)})},get:function(e,o,n){t({method:"GET",url:e}).then(function(t){t.data.redirect_to&&(window.location=t.data.redirect_to),o(t.data)},function(t){n({message:"Error: Could not connect to the server."}),console.log("GET error: "+t)})}}}t.$inject=["$http"],angular.module("tweetstockr").factory("networkService",t)}(),function(){"use strict";function t(t,e){return{getPortfolio:function(o,n){e.getAuth(t.apiUrl+"/portfolio",function(t){o(t)},function(t){n(t)})}}}t.$inject=["CONFIG","networkService"],angular.module("tweetstockr").factory("portfolioService",t)}(),function(){"use strict";function t(t,e){return{getProducts:function(o,n){e.getAuth(t.apiUrl+"/shop",function(t){o(t)},function(t){n(t)})},postPurchase:function(o,n,r){e.postAuth(t.apiUrl+"/shop/buy",{code:o},function(t){n(t)},function(t){r(t)})}}}t.$inject=["CONFIG","networkService"],angular.module("tweetstockr").factory("shopService",t)}(),function(){"use strict";function t(t,e){return{getActiveTournaments:function(o,n){e.getAuth(t.apiUrl+"/tournaments",function(t){o(t)},function(t){n(t)})}}}t.$inject=["CONFIG","networkService"],angular.module("tweetstockr").factory("tournamentService",t)}(),function(){"use strict";function t(t,e,o,n){return{getProfile:function(t,e){o.getAuth(n.apiUrl+"/profile",function(e){t(e)},function(t){e(t)})},getBalance:function(t,e){o.getAuth(n.apiUrl+"/balance",function(e){t(e)},function(t){e(t)})},resetAccount:function(t,r){o.postAuth(n.apiUrl+"/reset",{},function(o){e.updateCurrentUser(),t(o)},function(t){r(t)})},joysticketLogin:function(t,e){o.getAuth(n.apiUrl+"/joylogin",function(e){t(e)},function(t){e(t)})},joysticketLogout:function(t,e){o.getAuth(n.apiUrl+"/joylogout",function(t){window.location.reload()},function(t){e(t)})}}}t.$inject=["$http","$rootScope","networkService","CONFIG"],angular.module("tweetstockr").factory("userService",t)}(),function(){"use strict";function t(t,e,o,n){return{getTransactions:function(t,e){o.getAuth(n.apiUrl+"/statement",function(e){t(e)},function(t){e(t)})},getStats:function(t,e){o.getAuth(n.apiUrl+"/stats",function(e){t(e)},function(t){e(t)})}}}t.$inject=["$http","$rootScope","networkService","CONFIG"],angular.module("tweetstockr").factory("walletService",t)}(),angular.module("tweetstockr").directive("countdown",["$timeout",countdown]),function(){"use strict";angular.module("tweetstockr").directive("navbar",function(){return{restrict:"E",templateUrl:"components/header.html",controller:"headerController"}})}(),function(){"use strict";function t(t,e,o){t.updateCurrentUser=function(){o.getProfile(function(t){e.username=t.user.twitter.displayName,e.joysticket=t.user.joysticket,t.user.joysticket?e.joyUser=t.user.joysticket.username:e.joyUser=!1,e.twitterUser=t.user.twitter.username,e.balance=t.balance,e.ranking=t.ranking,void 0==t.user.tokens?e.tokens=0:e.tokens=t.user.tokens,e.profileImage=t.user.twitter.profile_image,e.profileImageThumb=t.user.twitter.profile_image_normal,e.twitterUrl="https://twitter.com/"+t.user.twitter.username},function(t){console.log("Error: "+t.message)})},t.updateCurrentUser()}t.$inject=["$rootScope","$scope","userService"],angular.module("tweetstockr").controller("headerController",t)}(),function(){"use strict";function t(t,e,o,n,r,i,c,a,u){function s(t){var e=Date.parse(t)-Date.parse(new Date),o=Math.floor(e/1e3%60),n=Math.floor(e/1e3/60%60),r=Math.floor(e/36e5%24),i=Math.floor(e/864e5);return{total:e,days:i,hours:r,minutes:n,seconds:o}}function l(t){function o(){var o=s(t);if(o.total>0){var r=("0"+o.minutes).slice(-2)+":"+("0"+o.seconds).slice(-2);a(function(){e.nextUpdateIn=r,e.nextUpdatePerc=o.total/e.roundDuration*100})}else a(function(){e.nextUpdateIn="00:00",e.nextUpdatePerc=0}),clearInterval(n)}o();var n=setInterval(o,1e3)}function f(){r.getRound(function(t){var o=new Date(t.nextUpdate);l(o);for(var n=t.stocks,r=0;r<n.length;r++){var i=n[r],c=i.history.length;if(i.price>0&&c>1&&i.history[1].price>0){var u=100*(i.price/i.history[1].price-1);i.variation=Math.round(u).toFixed(0)+"%",i.lastMove=0>u?"danger":"success",i.icon=0>u?"fa-caret-down":"fa-caret-up"}var s={};s.labels=[],s.series=[[]];for(var f=c-1;f>=0;f--){var d=new Date(i.history[f].created),p=d.getHours()+":"+d.getMinutes();s.series[0].push(i.history[f].price),s.labels.push(p)}i.chartData=s}e.responseReceived=!0,a(function(){e.roundDuration=t.roundDuration,e.stocks=n,e.getPortfolio()})},function(t){c.error(t.message)})}e.loading=!1,e.responseReceived=!1,f();u(f,1e4);e.chartOptions={showArea:!0},e.tabs=[{title:"Shares",url:"components/shares.html",icon:"icons/shares-icon.html"},{title:"Portfolio",url:"components/portfolio.html",icon:"icons/portfolio-icon.html"}],e.currentTab="components/shares.html",e.onClickTab=function(t){"components/shares.html"===t.url?(e.currentTab=t.url,e.isActiveTab=function(t){return t===e.currentTab}):"components/portfolio.html"===t.url&&(e.currentTab=t.url,e.isActiveTab=function(t){return t===e.currentTab})},e.isActiveTab=function(t){return t===e.currentTab},e.sellShare=function(t){e.stockBtn=!0,r.sell(t.tradeId,function(t){var o=document.getElementById("audio2");o.play(),e.getPortfolio(),c.success(t.message)},function(t){c.error(t.message)})},e.buyShare=function(t,o){e.stockBtn=!0,r.buy(t,o,function(t){c.success(t);var o=document.getElementById("audio");o.play(),e.getPortfolio()},function(t){c.error(t.message)})},e.getPortfolio=function(){o.getPortfolio(function(t){e.portfolio=t;for(var o=0;o<e.portfolio.length;o++){var n=e.portfolio[o],r=n.history.length,i={};i.labels=[],i.series=[[]];for(var c=r-1;c>=0;c--){var a=new Date(n.history[c].created),u=a.getHours()+":"+a.getMinutes();i.series[0].push(n.history[c].price),i.labels.push(u)}n.chartData=i}e.responseReceived=!0,e.loading=!0,e.stockBtn=!1},function(t){c.error(t.message),console.log("Portfolio Error: "+t.message)})}}t.$inject=["$rootScope","$scope","portfolioService","networkService","marketService","CONFIG","Notification","$timeout","$interval"],angular.module("tweetstockr").controller("marketController",t)}(),function(){"use strict";function t(t,e,o,n){t.updateCurrentUser(),e.resetAccount=function(){o.resetAccount(function(t){t.message&&n.success(t.message)},function(t){t.message&&n.error(t.message)})},e.joysticketLogin=function(){o.joysticketLogin(function(t){t.url&&(window.location.href=t.url)},function(t){console.log(t)})},e.joysticketLogout=function(){o.joysticketLogout(function(t){t.url&&(window.location.href=t.url)},function(t){console.log(t)})}}t.$inject=["$rootScope","$scope","userService","Notification"],angular.module("tweetstockr").controller("profileController",t)}(),function(){"use strict";function t(t,e){t.loading=!1,e.getRanking(function(e){t.rankingList=e,t.loading=!0},function(t){console.log("error: ",JSON.stringify(t))})}t.$inject=["$scope","leaderboardService"],angular.module("tweetstockr").controller("rankingController",t)}(),function(){"use strict";function t(t,e,o){t.loading=!1,e.getProducts(function(e){t.productsList=e,t.loading=!0},function(e){t.productsList=e,console.log("error: ",JSON.stringify(e))}),t.buyProduct=function(t){e.postPurchase(t,function(t){o.success(t)},function(t){o.error(t.message)})}}t.$inject=["$scope","shopService","Notification"],angular.module("tweetstockr").controller("shopController",t)}(),function(){"use strict";function t(t,e){t.loading=!1,e.getActiveTournaments(function(e){t.tournamentsList=e,t.loading=!0},function(t){console.log("error: ",JSON.stringify(t))})}t.$inject=["$scope","tournamentService"],angular.module("tweetstockr").controller("tournamentsController",t)}(),function(){"use strict";function t(t,e){t.loading=!1,e.getTransactions(function(e){t.transactionList=e,t.loading=!0},function(t){console.log("error: ",JSON.stringify(t))}),e.getStats(function(e){t.stats=e},function(t){console.log("error: ",JSON.stringify(t))})}t.$inject=["$scope","walletService"],angular.module("tweetstockr").controller("walletController",t)}();