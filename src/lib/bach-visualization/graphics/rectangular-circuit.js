/**********************************************************************

File     : rectangular-circuit.js
Project  : N Simulator Library
Purpose  : Source file for a rectangular circuit object.
Revisions: Original definition by Lawrence Gunn.
           2015/02/09

Copyright (c) 2015 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

Bach.RectangularCircuit = function() {
  this.width = 1.0;
  this.length = 1.0;
};

Bach.RectangularCircuit.prototype.build = function(parentObject3d) {
  this.parent = parentObject3d;
  this.material = new THREE.LineBasicMaterial({
    color: 0x8888ff,
    linewidth: 3
  });

  this.update();
};

Bach.RectangularCircuit.prototype.update = function() {
  if(!this.parent) { return; }

  if(this.line) {
    this.parent.remove(this.line);
  }

  var geometry = new THREE.Geometry();
  var w2 = 0.5*this.width;
  var l2 = 0.5*this.length;

  geometry.vertices.push(
    new THREE.Vector3(  w2,  l2, 0 ),
    new THREE.Vector3(  w2, -l2, 0 ),
    new THREE.Vector3( -w2, -l2, 0 ),
    new THREE.Vector3( -w2,  l2, 0 ),
    new THREE.Vector3(  w2,  l2, 0 )
  );

  this.line = new THREE.Line( geometry, this.material );
  this.parent.add(this.line);
};
