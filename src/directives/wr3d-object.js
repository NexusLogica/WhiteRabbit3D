/**********************************************************************

 File     : wr3d-object.js
 Project  : N Simulator Library
 Purpose  : Source file for a WhiteRabbit3D style.
 Revisions: Original definition by Lawrence Gunn.
            2014/12/18

 Copyright (c) 2014 by Lawrence Gunn
 All Rights Reserved.

 */
'use strict';

angular.module('wr3dApp').directive('wr3dObject', [function() {
  return {
    restrict: 'E',
    scope: { },
    controller: ['$scope', '$element', '$attrs', '$timeout', '$parse', 'Wr3dExtension', function ($scope, $element, $attrs, $timeout, $parse, Wr3dExtension) {
      Wr3dExtension.initialize(this, 'wr3dObject', $scope, $element, $attrs);
    }],
    link: function($scope, $element, $attrs, $ctrl) {
      $scope.notifyScene();
    }
  };
}]);
