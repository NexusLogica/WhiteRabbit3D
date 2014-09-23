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
  var _this = this;
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

  var initialize = function(canvas) {
    var canvasElement = $(canvas);
    _this.width  = canvasElement.width();
    _this.height = canvasElement.height();

    _this.nearFrustrum = 0.1;
    _this.farFrustrum = 10000.0;
    _this.verticalViewAngle = 30.0; // degrees

    _this.selectTextureWidth = _this.width;
    _this.selectTextureHeight = _this.height;

    _this.gl = canvasElement.get(0).getContext('experimental-webgl', { preserveDrawingBuffer: true } );
    var gl = _this.gl;

    // Load shaders
    _this.simpleShader = {};
    _this.simpleShader.vertex = createShaderFromScriptElement(gl, 'flat-vertex-shader');
    _this.simpleShader.fragment = createShaderFromScriptElement(gl, 'flat-fragment-shader');
    _this.simpleShader.program = createProgram(gl, [_this.simpleShader.vertex, _this.simpleShader.fragment]);

    gl.cullFace(gl.BACK);
    gl.enable(gl.CULL_FACE);
    gl.clearColor(0.0, 0.0, 1.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.viewport(0, 0, _this.width, _this.height);

    _this.initialTime = (new Date()).getTime();

    // Set up the camera.
    _this.projectionMatrix = mat4.create();
    var yHalf = _this.nearFrustrum*Math.tan(_this.verticalViewAngle*Math.PI/180.0);
    var xHalf = yHalf*_this.width/_this.height;
    _this.perspectiveParams = { left: -xHalf, right: xHalf, bottom: -yHalf, top: yHalf, near: _this.nearFrustrum, far: _this.farFrustrum };
    _this.viewPort = { width: _this.width, height: _this.height };

    _this.perspective = Ngl.Perspective();
    _this.perspective.perspective(_this.projectionMatrix, _this.perspectiveParams);
    _this.perspective.perspective(_this.selectProjectionMatrix, _this.perspectiveParams);
//    mat4.frustum(_this.projectionMatrix, -xHalf, xHalf, -yHalf, yHalf, _this.nearFrustrum, _this.farFrustrum);
//    console.log('from mine = '+mat4.str(_this.projectionMatrix));

//    var verification = mat4.create();
//    mat4.frustum(verification, -xHalf, xHalf, -yHalf, yHalf, _this.nearFrustrum, _this.farFrustrum);
//    console.log('from mat4.frustum = '+mat4.str(verification));
//    mat4.copy(_this.projectionMatrix, verification);

    // Create the selection framebuffer's texture.
    _this.selectionTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,  _this.selectionTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, _this.selectTextureWidth, _this.selectTextureHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    // Selection frame buffer object.
    _this.selectionFBO = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, _this.selectionFBO);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, _this.selectionTexture, 0);
    gl.bindTexture(gl.TEXTURE_2D, null);

    // Where to read the color into.
    _this.selectionPixel = new Uint8Array(4);

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
      throw new Error("gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE");
    }
  };

  var add = function(obj) {
    _this.children.push(obj);
  };

  var render = function(x, y) {

    var gl = _this.gl;
    _this.renderForSelect = false;
    _this.time = (new Date()).getTime() - _this.initialTime;

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    //  gl.bindFramebuffer(gl.FRAMEBUFFER, _this.selectionFBO);
    gl.viewport(0, 0, _this.width, _this.height);

    gl.clearColor(0.0, 1.0, 0.5, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.disable(gl.BLEND);

    if(_this.cameraTransformUpdated) {
      _this.cameraTransformUpdated = false;
      _this.transformUpdated = true;
      mat4.invert(_this.inverseCameraTransform, _this.cameraTransform);
    }

    if(_this.transformUpdated) {
      mat4.multiply(_this.worldTransform, _this.inverseCameraTransform, _this.transform);
    }

    for(var i in _this.children) {
      _this.children[i].render(gl, _this, _this);
    }

    _this.transformUpdated = false;
  //  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, _this.selectionPixel);
  //  console.log('color='+_this.selectionPixel[0]+' '+_this.selectionPixel[1]+' '+_this.selectionPixel[2]);
  };

  var getObjectUnderPixel = function(x, y) {

    if(x >= 0 && y >= 0 && x <= _this.width && y <= _this.height) {
      var gl = _this.gl;
      _this.renderForSelect = true;

      gl.bindFramebuffer(gl.FRAMEBUFFER, _this.selectionFBO);
//      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, _this.width, _this.height);

//      _this.perspective.pixelPerspective(_this.selectProjectionMatrix, _this.perspectiveParams, _this.viewPort, { x: x, y: y });

      gl.clearColor(0.0, 0.5+0.5*Math.sin(_this.time/5000), 0.5+0.5*Math.cos(_this.time/5000), 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.disable(gl.BLEND);

      if(_this.cameraTransformUpdated) {
        _this.cameraTransformUpdated = false;
        _this.transformUpdated = true;
        mat4.invert(_this.inverseCameraTransform, _this.cameraTransform);
      }

      if(_this.transformUpdated) {
        mat4.multiply(_this.worldTransform, _this.inverseCameraTransform, _this.transform);
      }

      for(var i in _this.children) {
        _this.children[i].render(gl, _this, _this);
      }

      _this.transformUpdated = false;
      gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, _this.selectionPixel);
      console.log('x,y = '+x+','+y+'   color='+_this.selectionPixel[0]+' '+_this.selectionPixel[1]+' '+_this.selectionPixel[2]);
    }
  };

  return {
    initialize: initialize,
    add: add,
    render: render,
    getObjectUnderPixel: getObjectUnderPixel
  }
};
