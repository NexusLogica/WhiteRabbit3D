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
  Ngl.Dock.call(this);
  this.name = 'camera';
  this.cameraTransformUpdated = true;

  this.nearFrustrum = 0.1;
  this.farFrustrum = 10000.0;
  this.verticalViewAngle = 30.0; // degrees

  this.inverseCameraTransform = mat4.create();
  mat4.translate(this.transform, this.transform, vec3.fromValues(0.0, 0.0, 1.25 ));
  mat4.invert(this.inverseCameraTransform, this.transform);
  this.workingTransform = mat4.create(); // a temporary matrix for calculations.

  this.projectionTransform = mat4.create();
};

Ngl.Camera.prototype = Object.create(Ngl.Dock.prototype);

Ngl.Camera.prototype.initialize = function(gl, scene) {
  Ngl.Dock.prototype.initialize.call(this, gl, scene);

  this.width  = gl.drawingBufferWidth;    // width in pixels
  this.height = gl.drawingBufferHeight;   // height in pixels

  // Set up the camera.
  var yHalf = this.nearFrustrum*Math.tan(this.verticalViewAngle*Math.PI/180.0);
  var xHalf = yHalf*this.width/this.height;

  this.projectionTransform = mat4.create();
  mat4.perspective(this.projectionTransform, this.verticalViewAngle*Math.PI/180.0, this.width/this.height, this.nearFrustrum, this.farFrustrum);
};

Ngl.Camera.prototype.preRender = function(gl, scene) {
  if(!this.initialized) {
    this.initialize(gl, scene);
  }
};

Ngl.Camera.prototype.getPixelSizeAtPosition = function(viewTransform) {
  return this.getPixelSizeAtCameraZ(viewTransform[14]);
};

Ngl.Camera.prototype.getPixelSizeAtCameraZ = function(cameraZ) {
  var widthAtFrustrum = 2.0*Math.tan(0.5*0.01745329251*this.verticalViewAngle);
  return Math.abs(cameraZ*widthAtFrustrum/this.height);
};