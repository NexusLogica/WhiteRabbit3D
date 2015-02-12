/**********************************************************************

File     : reference-frame.js
Project  : N Simulator Library
Purpose  : Source file for a reference frame object.
Revisions: Original definition by Lawrence Gunn.
           2015/02/10

Copyright (c) 2015 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

Bach.ReferenceFrame = function() {
  this.x = 0.0;
  this.y = 0.0;
  this.z = 0.0;
  this.rotationX = 0.0;
  this.rotationY = 0.0;
  this.rotationZ = 0.0;
  this.showAxis = true;

  this.graphics = [];
};

Bach.ReferenceFrame.prototype.addGraphic = function(graphic) {
  this.graphics.push(graphic);
}

Bach.ReferenceFrame.prototype.build = function(parentObject3d) {
  this.parent = parentObject3d;

  this.parent = parentObject3d;
  this.axis = new THREE.AxisHelper(0.1);
  this.parent.add(this.axis);

  this.object3d = new THREE.Object3D();
  this.parent.add(this.object3d);

  for(var i=0; i<this.graphics.length; i++) {
    this.graphics[i].build(this.object3d);
  }
  this.update();
};

Bach.ReferenceFrame.prototype.update = function() {
  if(!this.parent) { return; }

  this.axis.visible = this.showAxis;
  this.object3d.position.set(this.x, this.y, this.z);
  var e = new THREE.Euler(this.rotationX, this.rotationY, this.rotationZ, "ZXY");
  this.object3d.quaternion.setFromEuler(e);
};
