/**********************************************************************

File     : rectangular-transform.js
Project  : N Simulator Library
Purpose  : Source file for a rectangular surface transform.
Revisions: Original definition by Lawrence Gunn.
           2015/01/20

Copyright (c) 2015 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

Ngl.Surface.RectangularTransform = function() {
  Ngl.Surface.SurfaceMorph.call(this);
  this.pos = vec3.create();
  this.posOut = vec3.create();
};

Ngl.Surface.RectangularTransform.prototype.warpPoint = function(vecIn, vecOut, transformBefore, surfaceData, transformAfter, integerData) {
  vec3.transformMat4(this.pos, vecIn, transformBefore);

  // surface data:
  var scaleX = surfaceData[0];
  var scaleY = surfaceData[1];
  var scaleZ = surfaceData[2];

  var x = this.pos[0]*scaleX;
  var y = this.pos[1]*scaleY;
  var z = this.pos[2]*scaleZ;

  vec3.set(this.posOut, x, y, z);
  vec3.transformMat4(vecOut, this.posOut, transformAfter);
};

Ngl.Surface.RectangularTransform.prototype.warpTransform = function(transIn, transOut, transformBefore, surfaceData, transformAfter, integerData) {
  mat4.multiply(this.trans, transformBefore, transIn);

  var scaleX = surfaceData[0];
  var scaleY = surfaceData[1];
  var scaleZ = surfaceData[2];

  // This is kind of an arbitrary choice.
  var pixelScaling = Math.sqrt(scaleX*scaleX + scaleY*scaleY + scaleZ*scaleZ)/Math.sqrt(3.0);

  this.trans[12] *= scaleX;
  this.trans[13] *= scaleY;
  this.trans[14] *= scaleZ;

  mat4.multiply(transOut, transformAfter, this.trans);
  return pixelScaling;
};
