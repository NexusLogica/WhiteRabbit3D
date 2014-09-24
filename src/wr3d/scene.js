/**********************************************************************

File     : scene.js
Project  : N Simulator Library
Purpose  : Source file for a field viewer settings component.
Revisions: Original definition by Lawrence Gunn.
           2014/09/20

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var Ngl = Ngl || {};

Ngl.Scene = function() {
  this.children = [];
  this.transformUpdated = true;
  this.cameraTransformUpdated = true;

  this.transform = mat4.create();
  this.worldTransform = mat4.create();
  this.cameraTransform = mat4.create();
  this.inverseCameraTransform = mat4.create();
  mat4.translate(this.cameraTransform, this.cameraTransform, vec3.fromValues(0.0, 0.0, 0.15 ));

  this.va = vec3.create();
  this.vb = vec3.create();
  this.vc = vec3.create();
  this.vr = vec3.create();
  this.vu = vec3.create();
  this.vn = vec3.create();
  this.m  = mat4.create();
  this.projectionMatrix = mat4.create();
  this.selectProjectionMatrix = mat4.create();
  this.selectTextureWidth = 1;
  this.selectTextureHeight = 1;
}

Ngl.Scene.prototype = {
  initialize: function(canvas) {
    var canvasElement = $(canvas);
    this.width  = canvasElement.width();
    this.height = canvasElement.height();

    this.nearFrustrum = 0.1;
    this.farFrustrum = 10000.0;
    this.verticalViewAngle = 30.0; // degrees

    this.selectTextureWidth = this.width;
    this.selectTextureHeight = this.height;

    this.gl = canvasElement.get(0).getContext('experimental-webgl', { preserveDrawingBuffer: true } );
    var gl = this.gl;

    // Load shaders
    this.simpleShader = {};
    this.simpleShader.vertex = createShaderFromScriptElement(gl, 'flat-vertex-shader');
    this.simpleShader.fragment = createShaderFromScriptElement(gl, 'flat-fragment-shader');
    this.simpleShader.program = createProgram(gl, [this.simpleShader.vertex, this.simpleShader.fragment]);

    gl.cullFace(gl.BACK);
    gl.enable(gl.CULL_FACE);
    gl.clearColor(0.0, 0.0, 1.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.viewport(0, 0, this.width, this.height);

    this.initialTime = (new Date()).getTime();

    // Set up the camera.
    var yHalf = this.nearFrustrum*Math.tan(this.verticalViewAngle*Math.PI/180.0);
    var xHalf = yHalf*this.width/this.height;

    this.projectionMatrix = mat4.create();
    mat4.frustum(this.projectionMatrix, -xHalf, xHalf, -yHalf, yHalf, this.nearFrustrum, this.farFrustrum);

    // Create the selection framebuffer's texture.
    this.selectionTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,  this.selectionTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.selectTextureWidth, this.selectTextureHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    // Selection frame buffer object.
    this.selectionFBO = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.selectionFBO);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.selectionTexture, 0);
    gl.bindTexture(gl.TEXTURE_2D, null);

    // Where to read the color into.
    this.selectionPixel = new Uint8Array(4);

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      throw new Error("gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE");
    }
  },

  add: function(obj) {
    this.children.push(obj);
  },

  render: function(x, y) {

    var gl = this.gl;
    this.renderForSelect = false;
    this.time = (new Date()).getTime() - this.initialTime;

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    //  gl.bindFramebuffer(gl.FRAMEBUFFER, this.selectionFBO);
    gl.viewport(0, 0, this.width, this.height);

    gl.clearColor(0.0, 1.0, 0.5, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.disable(gl.BLEND);

    if(this.cameraTransformUpdated) {
      this.cameraTransformUpdated = false;
      this.transformUpdated = true;
      mat4.invert(this.inverseCameraTransform, this.cameraTransform);
    }

    if(this.transformUpdated) {
      mat4.multiply(this.worldTransform, this.inverseCameraTransform, this.transform);
    }

    for(var i = 0; i<this.children.length; i++) {
      this.children[i].render(gl, this, this);
    }

    this.transformUpdated = false;
  //  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, this.selectionPixel);
  //  console.log('color='+this.selectionPixel[0]+' '+this.selectionPixel[1]+' '+this.selectionPixel[2]);
  },

  getObjectUnderPixel: function(x, y) {

    if(x >= 0 && y >= 0 && x <= this.width && y <= this.height) {
      var gl = this.gl;
      this.renderForSelect = true;

      gl.bindFramebuffer(gl.FRAMEBUFFER, this.selectionFBO);
      gl.viewport(0, 0, this.width, this.height);

      gl.clearColor(0.0, 0.5+0.5*Math.sin(this.time/5000), 0.5+0.5*Math.cos(this.time/5000), 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.disable(gl.BLEND);

      if(this.cameraTransformUpdated) {
        this.cameraTransformUpdated = false;
        this.transformUpdated = true;
        mat4.invert(this.inverseCameraTransform, this.cameraTransform);
      }

      if(this.transformUpdated) {
        mat4.multiply(this.worldTransform, this.inverseCameraTransform, this.transform);
      }

      for(var i = 0; i<this.children.length; i++) {
        this.children[i].render(gl, this, this);
      }

      this.transformUpdated = false;
      gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, this.selectionPixel);
      console.log('x,y = '+x+','+y+'   color='+this.selectionPixel[0]+' '+this.selectionPixel[1]+' '+this.selectionPixel[2]);
    }
  }
};
