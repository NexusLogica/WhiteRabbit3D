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
  this.viewTransform = mat4.create();
  this.projectionViewTransform = mat4.create();
};

Ngl.Dock.prototype.initialize = function(gl, scene) {
  this.initialized = true;
};

Ngl.Dock.prototype.render = function(gl, scene) {
  this.preRender(gl, scene);
  this.postRender(gl, scene);
};

Ngl.Dock.prototype.preRender = function(gl, scene) {
  if(!this.initialized) {
    this.initialize(gl, scene);
  }

  if(this.parent.transformUpdated || this.transformUpdated) {
    this.transformUpdated = true;
    mat4.multiply(this.viewTransform, this.parent.viewTransform,  this.transform);
    mat4.multiply(this.projectionViewTransform, scene.camera.projectionTransform, this.viewTransform);
  }
};

Ngl.Dock.prototype.postRender = function(gl, scene) {
  for(var i = 0; i<this.children.length; i++) {
    this.children[i].render(gl, scene);
  }
  this.transformUpdated = false;
};

Ngl.Dock.prototype.add = function(obj) {
  this.children.push(obj);
  obj.parent = this;
};

