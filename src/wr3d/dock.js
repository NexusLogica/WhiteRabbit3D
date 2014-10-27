/**********************************************************************

File     : dock.js
Project  : N Simulator Library
Purpose  : Source file for a base dock object.
Revisions: Original definition by Lawrence Gunn.
           2014/09/20

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

Ngl.Dock = function(position, size) {
  this.initialized = false;
  this.children = [];
  this.transformUpdated = true;
  this.transform = mat4.create();
  this.worldTransform = mat4.create();
  this.projectionModelView = mat4.create();
};

Ngl.Dock.prototype = {
  initialize: function(gl, scene) {
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

  },

  postRender: function(gl, scene) {
    for(var i = 0; i<this.children.length; i++) {
      this.children[i].render(gl, scene);
    }
  }
};
