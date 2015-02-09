/**********************************************************************

File     : field-scene.js
Project  : N Simulator Library
Purpose  : Source file for a field scene graphics object.
Revisions: Original definition by Lawrence Gunn.
           2014/09/02

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

Bach.FieldScene = function() {
  this.maxArrowLength = 0.5;
  this.arrowAutoScaling = 1.0;
  this.showPoints = false;
  this.showArrows = true;
  this.charges = [];
  this.arrows = [];

  this.gridCenterOriginal = new THREE.Vector3(0.0, 0.0, 0.0);
  this.gridCenterCurrent = this.gridCenterOriginal.clone();
};

Bach.FieldScene.prototype.setFieldAndGrid = function(field, grid) {
  this.field = field;
  this.grid = grid;
};

Bach.FieldScene.prototype.addCharge = function(position, magnitude, color) {
  var charge = {position: position, magnitude: magnitude, color: _.isUndefined(color) ? (magnitude > 0 ? 0xff0000 : 0x0000ff) : color };
  this.charges.push(charge);
}

Bach.FieldScene.prototype.build = function(scene) {

  this.scene = scene;

  this.grid.build();
  this.grid.applyField(this.field, this.gridCenterOriginal);

  // Set the max and min and keep those values. Note that if both values are positive then it is assumed the minimum
  // is zero, and the reverse if both are negative.
  this.gridMax = this.grid.max;
  this.gridMin = this.grid.min;
  if(this.gridMin > 0) {
    this.gridMin = 0.0;
    this.arrowAutoScaling = 1.0/this.gridMax;
  }
  else if(this.gridMax < 0) {
    this.gridMax = 0.0;
    this.arrowAutoScaling = -1.0/this.gridMin;
  } else {
    this.arrowAutoScaling = 1.0/Math.max(Math.abs(this.gridMax), Math.abs(this.gridMin));
  }

  this.absoluteMaxArrowLength = 2.0*this.maxArrowLength;

  if(this.showPoints) {
    this.geometry = this.createPoints()
    var buffer = this.buildCloud();
  }

  if(this.showArrows) {
    this.createArrows();
  }

  this.createCharges();

  this.axis = new THREE.AxisHelper(2.0);
  this.scene.add(this.axis);

  this.setLighting(scene);

  this.range = this.gridMax-this.gridMin;

  this.update(this.gridCenterOriginal);
};

Bach.FieldScene.prototype.slideGrid = function(vec) {
  var scale = 1.0
  var scaledVec = vec.clone().multiplyScalar(scale);
  var offset = this.gridCenterOriginal.clone().add(scaledVec);
  this.update(offset);
};

Bach.FieldScene.prototype.createPoints = function() {
  var numPoints = this.grid.points.length;

  this.positionsArray = new Float32Array(numPoints*3);
  this.colorsArray = new Float32Array(numPoints*3);

  var geometry = new THREE.BufferGeometry();
  geometry.addAttribute('position', new THREE.BufferAttribute(this.positionsArray, 3));
  geometry.addAttribute('color', new THREE.BufferAttribute(this.colorsArray, 3));
};

Bach.FieldScene.prototype.createArrows = function() {
  var numPoints = this.grid.points.length;
  for(var i=0; i<numPoints; i++) {
    var arrow = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 0, 0),
      1.0,
      0xffffff,
      1.2*this.gridMax,
      2.0*this.gridMax
    );
    var arrowFrame = new THREE.Object3D();
    arrowFrame.add(arrow);
    this.arrows.push(arrowFrame);
    this.scene.add(arrowFrame);
  }
};

Bach.FieldScene.prototype.buildCloud = function() {
  var material = new THREE.PointCloudMaterial({ size: 0.025, vertexColors: THREE.VertexColors });
  this.pointCloud = new THREE.PointCloud(this.geometry, material);
  this.scene.add(this.pointCloud);
};

Bach.FieldScene.prototype.createCharges = function() {
 for(var i in this.charges) {
    var charge = this.charges[i];
    if(!charge.graphic) {
      charge.graphic = new THREE.Mesh(
        new THREE.SphereGeometry(this.grid.size.x*0.1, 12, 10),
        new THREE.MeshPhongMaterial({
          specular: '#882222',
          color: '#FF0000',
          emissive: '#AA0000',
          shininess: 8  })
      );
      charge.graphic.overdraw = true;
      this.scene.add(charge.graphic);
    }
  }
};

Bach.FieldScene.prototype.update = function(offset) {
  this.grid.applyField(this.field, offset);

  var colorLow = new THREE.Color(0x00FF00);
  var colorHigh = new THREE.Color(0xFF0000);

  for(var i in this.grid.points) {
    var point = this.grid.points[i];

    var intensity = (point.intensity-this.gridMin)/this.range;
    var intensityColor = colorLow.clone();
    intensityColor.lerp(colorHigh, intensity);

    if(this.showPoints) {
      this.positionsArray[i*3]   = point.position.x;
      this.positionsArray[i*3+1] = point.position.y;
      this.positionsArray[i*3+2] = point.position.z;

      this.colorsArray[i*3]   = intensityColor.r;
      this.colorsArray[i*3+1] = intensityColor.g;
      this.colorsArray[i*3+2] = intensityColor.b;
    }
    if(this.showArrows) {
      this.updateArrow(this.arrows[i], point, intensityColor);
    }
  }

  if(this.showPoints) {
    this.geometry.computeBoundingBox();
  }
};

Bach.FieldScene.prototype.updateArrow = function(arrowFrame, point, color) {

  // Place the middle of the point.
  var scaling = this.arrowAutoScaling*this.maxArrowLength;
  var arrowDirection = point.fieldVec.clone().normalize();
  var arrowLength = scaling*point.fieldVec.length();

  var originOffset = arrowDirection.clone().multiplyScalar(-arrowLength*0.5);
  var origin = point.currentPosition.clone().add(originOffset);

  var sourcePos = new THREE.Vector3(point.position);
  var targetPos = new THREE.Vector3(0, 1, 0);
  var direction = new THREE.Vector3().subVectors(targetPos, sourcePos);
  if(Math.abs(arrowLength) < 1.0e-3) {
    arrowFrame.visible = false;
    return;
  }

  arrowFrame.visible = true;
  arrowFrame.position.copy(origin);

  var arrow = arrowFrame.children[0];

  if(Math.abs(arrowLength) > this.maxArrowLength) {
    var op = 1.0-(Math.abs(arrowLength)-this.maxArrowLength)/this.maxArrowLength;
    if(op < 0.0) {
      op = 0.0;
    }
    arrow.cone.material.transparent = true;
    arrow.line.material.transparent = true;
    arrow.cone.material.opacity= op;
    arrow.line.material.opacity= op;
  } else {
    arrow.cone.material.transparent = false;
    arrow.line.material.transparent = false;
  }

  arrow.setDirection(point.fieldVec.clone().normalize());
  var len = point.fieldVec.length();
  arrow.setLength(scaling*len, 0.3*scaling*len, 0.2*scaling*len);
  arrow.setColor(color);
};

Bach.FieldScene.prototype.setLighting = function(scene) {
  // add subtle ambient lighting
  var ambientLight = new THREE.AmbientLight(0x303030);
  scene.add(ambientLight);

  // directional lighting
  var directionalLight = new THREE.DirectionalLight(0xB0B0B0);
  directionalLight.position.set(0.8, 0.6, 1.2).normalize();
  scene.add(directionalLight);
};
