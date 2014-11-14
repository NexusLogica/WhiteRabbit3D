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
  this.surfaces = [];
};

Ngl.WrDock.prototype = Object.create(Ngl.Dock.prototype);

Ngl.WrDock.prototype.initialize = function(gl, scene) {
  Ngl.Dock.prototype.initialize.call(this, gl, scene);
  this.initialized = true;
  this.name = this.config.name;
  this.scaling3d = _.isUndefined(this.config.scaling3d) ? Ngl.Scaling.parent : Ngl.Scaling[this.config.scaling3d.toLowerCase()];
  this.recalculatePosition = true;
  this.wrScaleFactor = 1.0;
  this.magnification = _.isUndefined(this.config.magnification3d) ? 1.0 : this.config.magnification3d;
  this.totalScaling = 1.0;

  this.instructionLength = 4;
  this.instructions = new Int32Array(this.instructionLength);
  for(var i=0; i<this.instructionLength; i++) { this.instructions[i] = 0; }

  if(!this.config.surfaces3d || this.config.surfaces3d.length === 0) {
    this.config.surfaces3d = [];
    this.config.surfaces3d.push(new Ngl.Surface.Rectangle());
  } else {
    for(var i=0; i<this.config.surfaces3d.length; i++) {
      var conf = this.config.surfaces3d[i];
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

Ngl.WrDock.prototype.preRender = function(gl, scene) {
  if(!this.initialized) {
    this.initialize(gl, scene);
  }

  this.calculatePositioning(gl, scene);

  this.updateTransform(scene);
};

Ngl.WrDock.prototype.calculatePositioning = function(gl, scene) {
  if(this.recalculatePosition) {
    this.updateTransform(scene);
    var cameraZ = Math.abs(this.worldTransform[14]);
    this.pixelSize = scene.camera.getPixelSizeAtCameraZ(cameraZ);

    var translate = Ngl.pointFromPropString(this.config.position3d, 'translate');
    if(translate) {
      vec3.scale(translate, translate, this.pixelSize);
      this.transform[12] = translate[0];
      this.transform[13] = translate[1];
      this.transform[14] = translate[2];
      this.transformUpdated = true;
    }

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
    mat4.multiply(this.worldTransform, this.parent.worldTransform,  this.transform);
    mat4.multiply(this.projectionModelView, scene.camera.projectionMatrix, this.worldTransform);
  }
};

Ngl.WrDock.prototype.onPositioningRecalculated = function() {

};
