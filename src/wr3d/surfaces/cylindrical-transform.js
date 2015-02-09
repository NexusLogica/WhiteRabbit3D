/**********************************************************************

File     : cylindrical-transform.js
Project  : N Simulator Library
Purpose  : Source file for a cylindrical surface transform.
Revisions: Original definition by Lawrence Gunn.
           2015/01/20

Copyright (c) 2015 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

Ngl.Surface.CylindricalTransform = function() {
  Ngl.Surface.SurfaceMorph.call(this);
  this.pos = vec3.create();
  this.posOut = vec3.create();
  this.trans = mat4.create();

};

Ngl.Surface.CylindricalTransform.prototype.warpPoint = function(vecIn, vecOut, transformBefore, surfaceData, transformAfter, integerData) {
  vec3.transformMat4(this.pos, vecIn, transformBefore);

  // surface data:
  var referenceRadius = surfaceData[0];

  var angle = this.pos[0]/referenceRadius;
  var radius = referenceRadius*Math.pow(Math.E, -(referenceRadius-this.pos[1])/referenceRadius);
  var x = radius*Math.cos(angle);
  var y = radius*Math.sin(angle);
  var z = this.pos[2];
  vec3.set(this.posOut, x, y, z);

  vec3.transformMat4(vecOut, this.posOut, transformAfter);
};

Ngl.Surface.CylindricalTransform.prototype.warpTransform = function(transIn, transOut, transformBefore, surfaceData, transformAfter, integerData) {
  mat4.multiply(this.trans, transformBefore, transIn);

  // surface data:
  var referenceRadius = surfaceData[0];

  var angle = this.trans[0]/referenceRadius;

  var pixelScaling = Math.pow(Math.E, -this.trans[1]/referenceRadius);
  var radius = referenceRadius*pixelScaling;
  this.trans[12] = 0.0;
  this.trans[13] = radius;
  mat4.rotateZ(angle);

  mat4.multiply(transOut, transformAfter, this.trans);
  return pixelScaling;
};
