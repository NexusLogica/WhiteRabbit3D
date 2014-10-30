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
  this.initialized = false;
  this.children = [];
  this.transformUpdated = true;
  this.transform = mat4.create();
  this.worldTransform = mat4.create();
  this.projectionModelView = mat4.create();
};

Ngl.WrDock.prototype = Object.create(Ngl.Dock.prototype);

Ngl.WrDock.prototype.initialize = function(gl, scene) {
  Ngl.Dock.prototype.initialize.call(this, gl, scene);
  this.initialized = true;
  this.scaling3d = _.isUndefined(this.configuration.scaling3d) ? Ngl.Scaling.parent : Ngl.Scaling[this.configuration.scaling3d.toLowerCase()];
  this.recalculatePosition = true;
  this.wrScaleFactor = 1.0;
  this.magnification = _.isUndefined(this.configuration.magnification3d) ? 1.0 : this.configuration.magnification3d;
  this.totalScaling = 1.0;
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

    if(this.scaling3d === Ngl.Scaling.screen) {
      var cameraZ = Math.abs(this.worldTransform[14]);
      this.wrScaleFactor = scene.camera.getPixelSizeAtCameraZ(cameraZ);
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
