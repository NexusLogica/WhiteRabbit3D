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

Ngl.WrDock.prototype = {
  initialize: function(gl, scene) {
    Ngl.Dock.prototype.initialize.call(this, gl, scene);
    this.initialized = true;
  },

  preRender: function(gl, scene) {
    if(!this.initialized) {
      this.initialize(gl, scene);
    }

    if(this.parent.transformUpdated || this.transformUpdated) {
      mat4.multiply(this.worldTransform, this.parent.worldTransform,  this.transform);
      mat4.multiply(this.projectionModelView, scene.camera.projectionMatrix, this.worldTransform);
    }

  }
};
