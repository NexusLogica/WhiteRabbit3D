/**********************************************************************

File     : electric-field.js
Project  : N Simulator Library
Purpose  : Source file for a electric field of a point charge object.
Revisions: Original definition by Lawrence Gunn.
           2014/09/04

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

Bach.ElectricField = function() {
  this.position = new THREE.Vector3(0.0, 0.0, 0.0);
  this.charge = 1; // 1 indicates there is a single proton. Use -1 for electrons
  this.coulombsConstant = 8.9875517873681764e9 // Coulomb's constant N*m^2/C^2. Source is wikipedia
  this.electricCharge   = 1.602176565e-19;     // Coulombs per electron
  this.units = 'C/N';
};

/***
 * The electric field is k*q/r^2.
 * @param pos
 * @returns {THREE.Vector3}
 */
Bach.ElectricField.prototype.getFieldVectorAt = function(pos) {
  var fieldVec = pos.clone().sub(this.position);
  var lengthSq = fieldVec.lengthSq();
  if(lengthSq === 0) {
    return new THREE.Vector3(0.0, 0.0, 0.0);
  }

  var e = this.coulombsConstant*this.electricCharge*this.charge/lengthSq;
  fieldVec.setLength(e);
  return fieldVec;
};