/**********************************************************************

File     : background-video.js
Project  : N Simulator Library
Purpose  : Source file for a YouTube video background component.
Revisions: Original definition by Lawrence Gunn.
           2014/09/27

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('wr3dApp', ['ngRoute']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.when('/home', { templateUrl: 'src/pages/home-page/home-page.html' });
    $routeProvider.otherwise({redirectTo: '/home'});

    // use the HTML5 History API
    $locationProvider.html5Mode(true);

    Q.longStackSupport = true;
   }]);
