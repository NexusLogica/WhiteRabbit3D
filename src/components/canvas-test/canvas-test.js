/**********************************************************************

File     : canvas-test.js
Project  : N Simulator Library
Purpose  : Source file for a test component.
Revisions: Original definition by Lawrence Gunn.
           2014/10/25

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var WR3D = WR3D || {};

WR3D.CanvasTest = function($scene) {
  return {
    templateUrl: "../src/components/canvasTest/canvasTest.json",
    link: function($scope, $canvas) {
      var button = $canvas.find('zebra.ui.Button');
      button.bind(function() {
        Ngl.Log("MOUSE");
      });
    }
  };
};