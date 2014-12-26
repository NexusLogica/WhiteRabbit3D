/**********************************************************************

 File     : wr3d-dock.js
 Project  : N Simulator Library
 Purpose  : Source file for a WhiteRabbit3D style.
 Revisions: Original definition by Lawrence Gunn.
            2014/11/28

 Copyright (c) 2014 by Lawrence Gunn
 All Rights Reserved.

 */
'use strict';

Ngl.nextWr3dDockId = 0;

angular.module('wr3dApp').directive('wr3dDock', [function() {
  return {
    restrict: 'E',
    scope: { },
    controller: ['$scope', '$element', '$attrs', '$timeout', '$parse', 'Wr3dExtension', function ($scope, $element, $attrs, $timeout, $parse, Wr3dExtension) {
        Wr3dExtension.initialize(this, 'wr3dDock', $scope, $element, $attrs);
    }],
    link: function($scope, $element, $attrs, $ctrl) {
      $scope.notifyScene();
    }
  };
}]);
