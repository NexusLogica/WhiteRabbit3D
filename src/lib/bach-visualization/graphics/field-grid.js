/**********************************************************************

File     : field-grid.js
Project  : N Simulator Library
Purpose  : Source file for a field grid graphics object.
Revisions: Original definition by Lawrence Gunn.
           2014/09/03

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/

'use strict';

Bach.FieldGrid = function() {
  this.size = new THREE.Vector3(1.0, 1.0, 1.0);
  this.grid = new THREE.Vector3(5, 5, 5);
  this.points = [];
  this.min = 0.0;
  this.max = 0.0;
};

Bach.FieldGrid.prototype.build = function() {
  this.points = [];

  var xInc = this.size.x/(this.grid.x-1);
  var yInc = this.size.y/(this.grid.y-1);
  var zInc = this.size.z/(this.grid.z-1);

  var m = 0;
  var x = -0.5*this.size.x;
  for(var i = 0; i < this.grid.x; i++) {
    var y = -0.5*this.size.y;
    for(var j = 0; j < this.grid.y; j++) {
      var z = -0.5*this.size.z;
      for(var k = 0; k < this.grid.z; k++) {
        var vec = new THREE.Vector3(x, y, z);
        this.points.push({ position: vec });
        z += zInc;
        m++;
      }
      y += yInc;
    }
    x += xInc;
  }
};

Bach.FieldGrid.prototype.applyField = function(field, offset) {
  this.min = undefined;
  this.max = undefined;
  for(var i in this.points) {

    var point = this.points[i];
    point.fieldVec = field.getFieldVectorAt(point.position.clone().add(offset));
    point.intensity = point.fieldVec.length();
    if(_.isNaN(point.intensity)) {
      point.intensity = 0.0;
    }
    point.currentPosition = point.position.clone().add(offset);

    if(_.isUndefined(this.min)) {
      this.max = this.min = point.intensity;
    } else if(point.intensity > this.max) {
      this.max = point.intensity;
    } else if(point.intensity < this.min) {
      this.min = point.intensity;
    }
  }
};
