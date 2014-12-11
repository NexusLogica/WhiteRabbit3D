/**********************************************************************

File     : bach.js
Project  : N Simulator Library
Purpose  : Source file for the bach host page.
Revisions: Original definition by Lawrence Gunn.
           2014/12/05

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('wr3dApp').directive('bach', [function() {
  return {
    restrict: 'E',
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$timeout', '$compile', function (ComponentExtensions, $scope, $element, $attrs, $timeout, $compile) {
      ComponentExtensions.initialize(this, 'bach', $scope, $element, $attrs);

    }],
    link: function($scope, $element, $attrs, $ctrl) {
    }
  };
}]);
