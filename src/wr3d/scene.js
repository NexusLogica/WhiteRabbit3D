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
  mat4.translate(this.cameraTransform, this.cameraTransform, vec3.fromValues(0.0, 0.0, 3.0));


  var initialize = function(canvas) {
    var canvasElement = $(canvas);
    _this.width  = canvasElement.width();
    _this.height = canvasElement.height();

    _this.nearFrustrum = 0.1;
    _this.farFrustrum = 10000.0;
    _this.verticalViewAngle = 30.0; // degrees

    _this.gl = canvasElement.get(0).getContext('experimental-webgl', { preserveDrawingBuffer: true } );
    var gl = _this.gl;

    // Load shaders
    _this.simpleShader = {};
    _this.simpleShader.vertex = createShaderFromScriptElement(gl, 'flat-vertex-shader');
    _this.simpleShader.fragment = createShaderFromScriptElement(gl, 'flat-fragment-shader');
    _this.simpleShader.program = createProgram(gl, [_this.simpleShader.vertex, _this.simpleShader.fragment]);

    gl.cullFace(gl.BACK);
    gl.enable(gl.CULL_FACE);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.viewport(0, 0, _this.width, _this.height);

    _this.initialTime = (new Date()).getTime();

    // Set up the camera.
    _this.projectionMatrix = mat4.create();
    mat4.perspective(_this.projectionMatrix, _this.verticalViewAngle*Math.PI/180.0, _this.width/_this.height, _this.nearFrustrum, _this.farFrustrum);

  };

  var add = function(obj) {
    _this.children.push(obj);
  };

  var render = function() {
    var time = (new Date()).getTime() - _this.initialTime;
    var gl = _this.gl;

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
  };

  return {
    initialize: initialize,
    add: add,
    render: render
  }
};
