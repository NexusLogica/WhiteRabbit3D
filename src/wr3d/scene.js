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
  mat4.translate(this.cameraTransform, this.cameraTransform, vec3.fromValues(0.0, 0.0, 1.25 ));

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
  this.selectionPixel = new Uint8Array(4);
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
    this.shaders = {};
    this.addShader('flat');
    this.addShader('texture');
    this.addShader('selection-texture-builder');

    gl.cullFace(gl.BACK);
    gl.enable(gl.CULL_FACE);
    gl.clearColor(0.0, 0.0, 1.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    this.initialTime = (new Date()).getTime();

    this.selectionRenderer = new Ngl.SelectionRenderer();
    this.selectionRenderer.createSelectionTexture(gl, this, 512, 512);

    // Set up the camera.
    var yHalf = this.nearFrustrum*Math.tan(this.verticalViewAngle*Math.PI/180.0);
    var xHalf = yHalf*this.width/this.height;

    this.projectionMatrix = mat4.create();
    mat4.frustum(this.projectionMatrix, -xHalf, xHalf, -yHalf, yHalf, this.nearFrustrum, this.farFrustrum);
    // Alternatively...
    // mat4.perspective(this.projectionMatrix, 2.0*this.verticalViewAngle*Math.PI/180.0, 1, this.nearFrustrum, this.farFrustrum);

    // Create the selection framebuffer's texture.
/*    this.selectionTexture = gl.createTexture();
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
*/
    // Where to read the color into.

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      throw new Error('gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE');
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
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

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
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

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
//      console.log('x,y = '+x+','+y+'   color='+this.selectionPixel[0]+' '+this.selectionPixel[1]+' '+this.selectionPixel[2]);
    }
  },

  createSelectionTexture: function() {
    var gl = this.gl;
    var _this = this;

    _this.selectionTexture = gl.createTexture();
    var framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    framebuffer.width = 512;
    framebuffer.height = 512;

    gl.bindTexture(gl.TEXTURE_2D, _this.selectionTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, framebuffer.width, framebuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    var renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, framebuffer.width, framebuffer.height);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, _this.selectionTexture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

    // Render
    gl.viewport(0, 0, framebuffer.width, framebuffer.height);
    gl.clearColor(1.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.disable(gl.BLEND);

    var verts = [
      1,  1,
     -1,  1,
     -1, -1,
      1,  1,
     -1, -1,
      1, -1
    ];
    var vertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    var program = this.shaders['selection-texture'].program;
    gl.useProgram(program);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.readPixels(1, 1, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, _this.selectionPixel);
    console.log('x,y = '+1+','+1+'   color='+_this.selectionPixel[0]+' '+_this.selectionPixel[1]+' '+_this.selectionPixel[2]);

        // We are done. Clear the buffer info.
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  },







/*



var verts = [
      1,  1,
     -1,  1,
     -1, -1,
      1,  1,
     -1, -1,
      1, -1
];
var vertBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(0);

var program = this.shaders['selection-texture'].program;
gl.useProgram(program);

// create an empty texture
this.selectionTexture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, this.selectionTexture);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
gl.generateMipmap(gl.TEXTURE_2D);

// Create a framebuffer and attach the texture.
var fb = gl.createFramebuffer();
fb.width = 512;
fb.height = 512;
gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.selectionTexture, 0);
//    gl.viewport(0, 0, fb.width, fb.height);

    var renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, fb.width, fb.height);

    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);


// Render to the texture (using clear because it's simple)
gl.clearColor(1, 1, 0, 1); // green;
gl.clear(gl.COLOR_BUFFER_BIT);

// Now draw with the texture to the canvas
// NOTE: We clear the canvas to red so we'll know
// we're drawing the texture and not seeing the clear
// from above.
gl.bindFramebuffer(gl.FRAMEBUFFER, null);
gl.clearColor(1, 0, 0, 1); // red
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.TRIANGLES, 0, 6);

      gl.readPixels(1, 1, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, this.selectionPixel);
      console.log('x,y = '+1+','+1+'   color='+this.selectionPixel[0]+' '+this.selectionPixel[1]+' '+this.selectionPixel[2]);

    // We are done. Clear the buffer info.
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  },
*/

  addShader: function(name) {
    var shader = {};
    shader.vertex   = this.compileShaderFromElement(name+'-vertex-shader');
    shader.fragment = this.compileShaderFromElement(name+'-fragment-shader');
    shader.program  = this.createProgram(shader.vertex, shader.fragment);
    this.shaders[name] = shader;
  },

  createProgram: function(vertexShader, fragmentShader) {
    var gl = this.gl;
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    // Check the link status
    var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
      var lastError = gl.getProgramInfoLog (program);
      console.log('Error in program linking:' + lastError);

      gl.deleteProgram(program);
      return null;
    }
    return program;
  },

  compileShaderFromElement: function(scriptId) {
    var shaderSource = '';
    var shaderType;
    var shaderScript = document.getElementById(scriptId);
    if (!shaderScript) {
      console.log('ERROR: Unknown script element ' + scriptId);
      throw('Error: unknown script element ' + scriptId);
    }
    shaderSource = shaderScript.text;

    if (shaderScript.type === 'x-shader/x-vertex') {
      shaderType = this.gl.VERTEX_SHADER;
    } else if (shaderScript.type === 'x-shader/x-fragment') {
      shaderType = this.gl.FRAGMENT_SHADER;
    } else if (shaderType !== this.gl.VERTEX_SHADER && shaderType !== this.gl.FRAGMENT_SHADER) {
      console.log('ERROR: unknown shader type '+scriptId);
      return null;
    }

    return this.compileShader(shaderSource, shaderType);
  },

  compileShader: function(shaderSource, shaderType) {
    var gl = this.gl;
    // Create the shader object
    var shader = gl.createShader(shaderType);

    // Load and compile the shader source
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    // Check the compile status
    var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
      // Something went wrong during compilation; get the error
      var lastError = gl.getShaderInfoLog(shader);
      console.log('ERROR compiling shader "' + shader + '":' + lastError);
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }
};

Ngl.powerOfTwo = function(d) {
  var log2 = Math.log(2.0);
  var power = Math.ceil(Math.log(d)/log2);
  return Math.ceil(Math.pow(2.0, power)-0.5);
};
