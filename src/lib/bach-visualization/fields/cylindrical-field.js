/**********************************************************************

File     : cylindrical-field.js
Project  : N Simulator Library
Purpose  : Source file for a cylindrical field object.
Revisions: Original definition by Lawrence Gunn.
           2014/09/02

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

Bach.CylindricalField = function() {
  this.intensityAtDistance = 1.0; // Intensity of the field at a given distance from the axis.
  this.axis = new THREE.Vector3(0.0, 0.0, 1.0);
};

Bach.CylindricalField.prototype.getFieldVectorAt = function(vec) {
  var len = Math.sqrt(vec.x*vec.x+vec.y*vec.y);
  var out = new THREE.Vector3();
  out.crossVectors(this.axis, vec).normalize().multiplyScalar(this.intensityAtDistance*len);
  return out;
};