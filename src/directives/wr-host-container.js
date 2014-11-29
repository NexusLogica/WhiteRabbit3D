/**********************************************************************

 File     : wr-host-container.js
 Project  : WhiteRabbit3D
 Purpose  : Source file for a wr3d Html host container - i.e. the top level WR3D component.
 Revisions: Original definition by Lawrence Gunn.
            2014/11/29

 Copyright (c) 2014 by Lawrence Gunn
 All Rights Reserved.

 */
'use strict';

angular.module('wr3dApp').directive('wrHostContainer', [function() {
  return {
    restrict: 'E',
    controller: ['$scope', '$element', '$attrs', '$http', function ($scope, $element, $attrs, $http) {

      var initializeCanvas = function() {
        $scope.scene = new Ngl.Scene();
        $scope.canvas.data('scene', $scope.scene);
        $scope.scene.initialize($scope.canvas);

        if($attrs.hasOwnProperty('clearColor')) {
          var clearColor = $attrs.clearColor;
          var colorVec = Ngl.vecFromString(clearColor);
          $scope.scene.setClearColor(colorVec);
        }

        function render() {
         requestAnimationFrame(render);
          $scope.scene.render();
        }

        render();
      };

      $scope.$on('wr-canvas:canvas-ready', function(event, canvas) {
        $scope.canvas = canvas;
        initializeCanvas();
        event.stopPropagation();
      });

    }],
    link: function($scope, $element, $attrs, $ctrl) {

    }
  };
}]);
