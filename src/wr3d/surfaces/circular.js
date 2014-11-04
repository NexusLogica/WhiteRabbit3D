/**********************************************************************

File     : circular.js
Project  : N Simulator Library
Purpose  : Source file for a circular surface.
Revisions: Original definition by Lawrence Gunn.
           2014/11/03

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

Ngl.Surface.Circular = function() {
  this.radiusOuter = 250.0;
  this.positionAfter = new Float32Array([0.0, 0.0, 0.0]);
  this.mat  = new Float32Array(16);
  this.mat[0] = this.radiusOuter;
  this.mat[1] = this.positionAfter[0];
  this.mat[2] = this.positionAfter[1];
  this.mat[3] = this.positionAfter[2];

  this.ivec = new Int32Array(4);
};

Ngl.Surface.Circular.prototype.configure = function(panel) {

};

Ngl.Surface.Circular.prototype.attachToShader = function(gl, scene, locations) {
  gl.uniformMatrix4fv(locations.mat, gl.FALSE, this.mat);
  gl.uniform4iv(locations.ivec, this.ivec);
};
