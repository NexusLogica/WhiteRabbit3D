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

Ngl.Surface.CylindricalTransform.prototype.warpTransform = function(transIn, transOut, transformIn, surfaceData, transformOut, integerData) {
};