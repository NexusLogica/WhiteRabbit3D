/**********************************************************************

File     : surface-morph.js
Project  : N Simulator Library
Purpose  : Source file for a surface morph base class.
Revisions: Original definition by Lawrence Gunn.
           2015/01/12

Copyright (c) 2015 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

Ngl.Surface.Shaders = Ngl.Surface.Shaders || {};
Ngl.Surface.Shaders.RECTANGULAR = 1;
Ngl.Surface.Shaders.CIRCULAR    = 2;
Ngl.Surface.Shaders.CYLINDRICAL = 3;

Ngl.Surface.SurfaceMorph = function() {
  this.shaders = [ Ngl.Surface.Shaders.RECTANGULAR ];
  this.mat  = new Float32Array(16);
  this.before = mat4.create();
  this.after = mat4.create();
  this.ivec = new Int32Array(4);
};

Ngl.Surface.SurfaceMorph.prototype.attachToShader = function(gl, scene, locations, indexOfNextLocationToUse) {
  var location = locations[indexOfNextLocationToUse];
  gl.uniformMatrix4fv(location.mat, gl.FALSE, this.mat);
  gl.uniformMatrix4fv(location.before, gl.FALSE, this.before);
  gl.uniformMatrix4fv(location.after, gl.FALSE, this.after);
  gl.uniform4iv(location.ivec, this.ivec);
  return 1; // return the number of locations actually used.
};

Ngl.Surface.SurfaceMorph.prototype.fillInstructions = function(instructions, nextInstructionIndex) {
  for(var i=0; i<this.shaders.length; i++) {
    instructions[nextInstructionIndex] = this.shaders[i];
  }
  return this.shaders.length; // return the number of instructions actually used.
};

Ngl.Surface.SurfaceMorph.prototype.parseBeforeAfter = function() {
  Ngl.processTransformString(this.before, this.config.before);
  Ngl.processTransformString(this.after, this.config.after);
};

Ngl.Surface.SurfaceMorph.prototype.warpPoint = function(vecIn, vecOut) {
  this.surfaceTransform.warpPoint(vecIn, vecOut, this.before, this.mat, this.after, this.ivec);
}

