/**********************************************************************

File     : home.js
Project  : N Simulator Library
Purpose  : Source file for a home page component.
Revisions: Original definition by Lawrence Gunn.
           2014/09/27

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('wr3dApp').directive('home', [function() {
  return {
    restrict: 'E',
    templateUrl: 'src/components/home/home.html',
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$timeout', function (ComponentExtensions, $scope, $element, $attrs, $timeout) {
      ComponentExtensions.initialize(this, 'home', $scope, $element, $attrs);

    }],
    link: function($scope, $element, $attrs, $ctrl) {

    }
  };
}]);
