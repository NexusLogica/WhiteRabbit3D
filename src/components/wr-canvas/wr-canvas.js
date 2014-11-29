/**********************************************************************

File     : wr-canvas.js
Project  : N Simulator Library
Purpose  : Source file for a home page component.
Revisions: Original definition by Lawrence Gunn.
           2014/09/27

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('wr3dApp').directive('wrCanvas', [function() {
  return {
    restrict: 'E',
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$timeout', function (ComponentExtensions, $scope, $element, $attrs, $timeout) {
      ComponentExtensions.initialize(this, 'wrCanvas', $scope, $element, $attrs);


    }],
    link: function($scope, $element, $attrs) {
      var w = $element.width();
      var h = $element.height();
      if(!w) { w = 600; }
      if(!h) { h = 400; }
      var canvas = $element.append('<canvas width="'+w+'" height="'+h+'"></canvas>').find('canvas');

      var scene = new Ngl.Scene();
      canvas.data('scene', scene);
      scene.initialize(canvas);

      $scope.displayHosts = $attrs.wrHosts;
      if($attrs.hasOwnProperty('clearColor')) {
        var clearColor = $attrs.clearColor;
        var colorVec = Ngl.vecFromString(clearColor);
        scene.setClearColor(colorVec);
      }

      function render() {
        requestAnimationFrame(render);
        scene.render();
      }

      render();
    }
  };
}]);
