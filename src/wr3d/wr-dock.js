/**********************************************************************

File     : wr-dock.js
Project  : N Simulator Library
Purpose  : Source file for a base WhiteRabbit dock object.
Revisions: Original definition by Lawrence Gunn.
           2014/10/26

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

Ngl.WrDock = function(position, size) {
  Ngl.Dock.call(this);
  this.pixelSize = 1.0;
  this.wrTransform = mat4.create();
  this.wrTransformScaled = mat4.create();
  this.wrTransformAndTranform = mat4.create();
  this.surfaces = [];
};

Ngl.WrDock.prototype = Object.create(Ngl.Dock.prototype);

Ngl.WrDock.prototype.initialize = function(gl, scene) {
  Ngl.Dock.prototype.initialize.call(this, gl, scene);
  this.initialized = true;

  this.configureFromStyles();
  this.parseSurfaces();
};

Ngl.WrDock.prototype.configureFromStyles = function() {
  this.scaling3d = _.isUndefined(this.config['-wr3d-scaling3d']) ? Ngl.Scaling.parent : Ngl.Scaling[this.config['-wr3d-scaling3d'].toLowerCase()];
  this.recalculatePosition = true;
  this.wrScaleFactor = 1.0;
  this.magnification = _.isUndefined(this.config['-wr3d-magnification3d']) ? 1.0 : this.config['-wr3d-magnification3d'];
  this.totalScaling = 1.0;

  // Parse position3d
  var _this = this;
  var rotDeg;
  var position3d = this.config['-wr3d-position3d'];
  if(!_.isEmpty(position3d)) {
    var posGroups = (position3d+' ').split(/\)\s+/g);
    _.forEach(posGroups, function(pg) {
      pg = $.trim(pg);
      var posType = pg.substr(0, pg.indexOf('('));
      var posValue = pg.substr(pg.indexOf('(')+1);
      if(!_.isEmpty(posType)) {
        switch (posType) {
          case 'translate': {
            var posVec = Ngl.vecFromString(posValue);
            mat4.translate(_this.wrTransform, _this.wrTransform, posVec);
            break;
          }
          case 'rotateX': {
            rotDeg = Ngl.floatAndUnitFromString(posValue);
            mat4.rotateX(_this.wrTransform, _this.wrTransform, Ngl.radians(rotDeg.value));
            break;
          }
          case 'rotateY': {
            rotDeg = Ngl.floatAndUnitFromString(posValue);
            mat4.rotateY(_this.wrTransform, _this.wrTransform, Ngl.radians(rotDeg.value));
            break;
          }
          case 'rotateZ': {
            rotDeg = Ngl.floatAndUnitFromString(posValue);
            mat4.rotateZ(_this.wrTransform, _this.wrTransform, Ngl.radians(rotDeg.value));
            break;
          }
          default: {
            Ngl.log('ERROR: Invalid wr3d CSS type ' + posType);
          }
        }
      }
    });
  }
};

Ngl.WrDock.prototype.parseSurfaces = function() {

  this.instructionLength = 4;
  this.instructions = new Int32Array(this.instructionLength);
  var i;
  for(i=0; i<this.instructionLength; i++) { this.instructions[i] = 0; }

  this.flagsLength = 4;
  this.flags = new Int32Array(this.flagsLength);
  for(var j=0; i<this.flagsLength; i++) { this.instructions[i] = 0; }

  this.config.surface3d = this.parseSurface3d(this.config['-wr3d-surface3d']);

  if(!this.config.surface3d || this.config.surface3d.length === 0) {
    this.config.surface3d = [];
    this.config.surface3d.push(new Ngl.Surface.Rectangular());
  } else {
    for(i=0; i<this.config.surface3d.length; i++) {
      var conf = this.config.surface3d[i];
      var surface = null;
      switch(conf.type.toLowerCase()) {
        case 'rectangular': {
          surface = new Ngl.Surface.Rectangular();
          this.instructions[i] = 1;
          break;
        }
        case 'circular': {
          surface = new Ngl.Surface.Circular();
          this.instructions[i] = 2;
          break;
        }
      }
      if(surface) {
        this.surfaces.push(surface);
        surface.configure(this, conf);
      }
    }
  }
};

Ngl.WrDock.prototype.parseSurface3d = function(surface3d) {
  var parsed = [];
  if(!_.isEmpty(surface3d)) {
    var regex = /\([^)]+\)+?/g;
    var matches = surface3d.match(regex);
    for (var i = 0; i < matches.length; i++) {
      var surface = {};
      var m = matches[i];
      m = m.replace(/^\s*\(/, '');
      m = m.replace(/\)\s*$/, '');
      var s = m.split(',');
      for (var j = 0; j < s.length; j++) {
        var keyval = s[j].split(':');
        var key = $.trim(keyval[0]);
        var val = $.trim(keyval[1]);
        surface[key] = val;
      }
      parsed.push(surface);
    }
  }
  return parsed;
};

Ngl.WrDock.prototype.preRender = function(gl, scene) {
  if(!this.initialized) {
    this.initialize(gl, scene);
  }

  this.calculatePositioning(gl, scene);

  this.updateTransform(scene);
};

Ngl.WrDock.prototype.calculatePositioning = function(gl, scene) {
  if(this.recalculatePosition) {
    this.updateTransformWithoutWrTransform(scene);
    this.transformUpdated = true;

    var cameraZ = Math.abs(this.worldTransform[14]);
    this.pixelSize = scene.camera.getPixelSizeAtCameraZ(cameraZ);

    if(this.scaling3d === Ngl.Scaling.screen) {
      this.wrScaleFactor = this.pixelSize;
      this.totalScaling = this.wrScaleFactor*this.magnification;
    }

    this.onPositioningRecalculated();
    this.recalculatePosition = false;
  }
};

Ngl.WrDock.prototype.updateTransform = function(scene) {
  if(this.parent.transformUpdated || this.transformUpdated) {
    mat4.copy(this.wrTransformScaled, this.wrTransform);
    this.wrTransformScaled[12] *= this.totalScaling;
    this.wrTransformScaled[13] *= this.totalScaling;
    this.wrTransformScaled[14] *= this.totalScaling;

    mat4.multiply(this.wrTransformAndTranform, this.wrTransformScaled,  this.transform);
    mat4.multiply(this.worldTransform, this.parent.worldTransform,  this.wrTransformAndTranform);
    mat4.multiply(this.projectionModelView, scene.camera.projectionMatrix, this.worldTransform);
  }
};


Ngl.WrDock.prototype.updateTransformWithoutWrTransform = function(scene) {
  mat4.multiply(this.worldTransform, this.parent.worldTransform,  this.transform);
};

Ngl.WrDock.prototype.onPositioningRecalculated = function() {

};
