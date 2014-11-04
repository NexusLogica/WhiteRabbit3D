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
  this.mat  = new Float32Array(16);
  this.before = mat4.create();
  this.after = mat4.create();
  this.mat[0] = this.radiusOuter;

  this.ivec = new Int32Array(4);

  mat4.rotateZ(this.before, this.before, Ngl.radians(30.0));
  mat4.rotateZ(this.after, this.after, Ngl.radians(30.0));
};

Ngl.Surface.Circular.prototype.configure = function(panel) {

};

Ngl.Surface.Circular.prototype.attachToShader = function(gl, scene, locations) {
  gl.uniformMatrix4fv(locations.mat, gl.FALSE, this.mat);
  gl.uniformMatrix4fv(locations.before, gl.FALSE, this.before);
  gl.uniformMatrix4fv(locations.after, gl.FALSE, this.after);
  gl.uniform4iv(locations.ivec, this.ivec);
};
