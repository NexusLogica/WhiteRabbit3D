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

  this.va = vec3.create();
  this.vb = vec3.create();
  this.vc = vec3.create();
  this.vr = vec3.create();
  this.vu = vec3.create();
  this.vn = vec3.create();
  this.m  = mat4.create();
  this.perpPerspective   = mat4.create();
  this.selectPerspective = mat4.create();

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
    gl.clearColor(0.0, 0.0, 1.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.viewport(0, 0, _this.width, _this.height);

    _this.initialTime = (new Date()).getTime();

    // Set up the camera.
    _this.projectionMatrix = mat4.create();
    mat4.perspective(_this.projectionMatrix, _this.verticalViewAngle*Math.PI/180.0, _this.width/_this.height, _this.nearFrustrum, _this.farFrustrum);

    // Create the selection framebuffer's texture.
    _this.selectionTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,  _this.selectionTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

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

  var render = function() {

    var gl = _this.gl;
    _this.renderForSelect = false;
    _this.time = (new Date()).getTime() - _this.initialTime;

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, _this.width, _this.height);

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

  var getObjectUnderPixel = function(x, y) {

    if(x >= 0 && y >= 0 && x <= _this.width && y <= _this.height) {
      var gl = _this.gl;
      _this.renderForSelect = true;

      gl.bindFramebuffer(gl.FRAMEBUFFER, _this.selectionFBO);
      gl.viewport(0, 0, 700, 700);
//      gl.viewport(10, 0, 700, 700);

//      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.clear(gl.COLOR_BUFFER_BIT);
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
      gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, _this.selectionPixel);
      var value = _this.selectionPixel[0]+_this.selectionPixel[1]+_this.selectionPixel[2];
      console.log('color='+_this.selectionPixel[0]+' '+_this.selectionPixel[1]+' '+_this.selectionPixel[2]);
    }
  }

  var perspective = function(
    out,    // mat4 that will contain the perspective matrix
    left,   // x min
    right,  // x max
    bottom, // y min
    top,    // y max
    n,      // near plane
    f       // far plane
  ) {
    out[0]  = 2.0*n/(right-left);
    out[1]  = 0.0;
    out[2]  = 0.0;
    out[3]  = 0.0;
    out[4]  = 0.0;
    out[5]  = 2.0*n/(top-bottom);
    out[6]  = 0.0;
    out[7]  = 0.0;
    out[8]  = (right+left)/(right-left);
    out[9]  = (top+bottom)/(top-bottom);
    out[10] = -(f+n)/(f-n);
    out[11] = -1.0;
    out[12] = 0.0;
    out[13] = 0.0;
    out[14] = -2.0*f*n/(f-n);
    out[16] = 0.0;
  }


  var offsetPerspective = function(
    out, // mat4 that will contain the perspective matrix
    pa,  // vec3 - lower left position
    pb,  // vec3 - lower right position
    pc,  // vec3 - upper left position
    pe,  // vec3 - eye position (i.e. the origin)
    n,   // near plane distance
    f    // far plane distance
  ) {
    // Compute an orthonormal basis for the screen.
    vec3.subtract(_this.vr, pb, pa);
    vec3.subtract(_this.vu, pc, pa);

    vec3.normalize(_this.vr, _this.vr);
    vec3.normalize(_this.vu, _this.vu);
    vec3.cross(_this.vn, _this.vr, _this.vu);
    vec3.normalize(_this.vn, _this.vn);

    // Compute the screen corner vectors.
    vec3.subtract(_this.va, pa, pe);
    vec3.subtract(_this.vb, pb, pe);
    vec3.subtract(_this.vc, pc, pe);

    // Find the distance from the eye to screen plane.
    var d = -vec3.dot(_this.va, _this.vn);

    // Find the extent of the perpendicular projection.
    var nOverD = n/d;
    var l = vec3.dot(_this.vr, _this.va)*nOverD;
    var r = vec3.dot(_this.vr, _this.vb)*nOverD;
    var b = vec3.dot(_this.vu, _this.va)*nOverD;
    var t = vec3.dot(_this.vu, _this.vc)*nOverD;

    perspective(_this.perpPerspective , l, r, b, t, n, f);

    // Rotate the projection to be non-perpendicular.
    mat4.identity(_this.m);

    _this.m[0] = _this.vr[0]; _this.m[4] = _this.vr[1]; _this.m[ 8] = _this.vr[2];
    _this.m[1] = _this.vu[0]; _this.m[5] = _this.vu[1]; _this.m[ 9] = _this.vu[2];
    _this.m[2] = _this.vn[0]; _this.m[6] = _this.vn[1]; _this.m[10] = _this.vn[2];

    _this.m[15] = 1.0;

    mat4.multiply(_this.selectPerspective, _this.perspective, _this.m);

    // Move the apex of the frustum to the origin.
    _this.selectPerspective[12] -= pe[0];
    _this.selectPerspective[13] -= pe[1];
    _this.selectPerspective[14] -= pe[2];
  }

  return {
    initialize: initialize,
    add: add,
    render: render,
    getObjectUnderPixel: getObjectUnderPixel
  }
};
