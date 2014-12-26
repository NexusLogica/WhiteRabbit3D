/**********************************************************************

 File     : wr3d-panel.js
 Project  : N Simulator Library
 Purpose  : Source file for a WhiteRabbit3D style.
 Revisions: Original definition by Lawrence Gunn.
            2014/11/28

 Copyright (c) 2014 by Lawrence Gunn
 All Rights Reserved.

 */
'use strict';

Ngl.nextWr3dPanelId = 0;

angular.module('wr3dApp').directive('wr3dPanel', [function() {
  return {
    restrict: 'E',
    scope: { },
    controller: ['$scope', '$element', '$attrs', '$timeout', '$parse', 'Wr3dExtension', function ($scope, $element, $attrs, $timeout, $parse, Wr3dExtension) {
      Wr3dExtension.initialize(this, 'wr3dPanel', $scope, $element, $attrs);

      // TODO: Find a proper value for 'top'
      $element.css({ 'position': 'fixed', 'top': '-2000px', 'left': '0px' });
    }],
    link: function($scope, $element, $attrs, $ctrl) {
      $scope.notifyScene();
      $element.find('>div').data('wr3d', $scope);
    }
  };
}]);
