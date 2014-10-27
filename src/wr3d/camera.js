/**********************************************************************

File     : camera.js
Project  : N Simulator Library
Purpose  : Source file for a camera object.
Revisions: Original definition by Lawrence Gunn.
           2014/10/27

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

Ngl.Camera = function() {
  this.cameraTransformUpdated = true;

  this.nearFrustrum = 0.1;
  this.farFrustrum = 10000.0;
  this.verticalViewAngle = 30.0; // degrees

  this.cameraTransform = mat4.create();
  this.inverseCameraTransform = mat4.create();
  mat4.translate(this.cameraTransform, this.cameraTransform, vec3.fromValues(0.0, 0.0, 1.25 ));
  mat4.invert(this.inverseCameraTransform, this.cameraTransform);


  this.va = vec3.create();
  this.vb = vec3.create();
  this.vc = vec3.create();
  this.vr = vec3.create();
  this.vu = vec3.create();
  this.vn = vec3.create();
  this.m  = mat4.create();
  this.projectionMatrix = mat4.create();
  this.selectProjectionMatrix = mat4.create();
};

Ngl.Camera.prototype = {
  initialize: function(gl, canvas) {
    this.width  = gl.drawingBufferWidth;    // width in pixels
    this.height = gl.drawingBufferHeight;   // height in pixels

    // Set up the camera.
    var yHalf = this.nearFrustrum*Math.tan(this.verticalViewAngle*Math.PI/180.0);
    var xHalf = yHalf*this.width/this.height;

    this.projectionMatrix = mat4.create();
    mat4.frustum(this.projectionMatrix, -xHalf, xHalf, -yHalf, yHalf, this.nearFrustrum, this.farFrustrum);
    // Alternatively...
    // mat4.perspective(this.projectionMatrix, 2.0*this.verticalViewAngle*Math.PI/180.0, 1, this.nearFrustrum, this.farFrustrum);
  },

  getPixelSizeAtCameraZ: function(cameraZ) {
    var sinViewAngle = 2.0*Math.tan(0.5*0.01745329251*this.verticalViewAngle);
    var screenHeight = cameraZ*sinViewAngle;
    return screenHeight/this.height;
  }
};