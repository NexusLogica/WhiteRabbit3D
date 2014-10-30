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

  this.transform = mat4.create();
  this.worldTransform = mat4.create();

  this.selectProjectionMatrix = mat4.create();
  this.selectTextureWidth = 1;
  this.selectTextureHeight = 1;
  this.selectionPixel = new Uint8Array(4);
  this.doSelect = false;

  this.wrObjects = [];
  this.wrObjectsByColorHash = {};
  this.wrNextColor = new Ngl.IntegerColor();

  this.camera = new Ngl.Camera();

  this.mouseEvents = [];
};

Ngl.Scene.prototype.initialize = function(canvas) {
  this.canvasElement = $(canvas);
  this.width  = this.canvasElement.width();
  this.height = this.canvasElement.height();

  this.selectTextureWidth = this.width;
  this.selectTextureHeight = this.height;

  this.canvasElement.data('wr3dScene', this);
  this.gl = this.canvasElement.get(0).getContext('experimental-webgl', { preserveDrawingBuffer: true } );
  var gl = this.gl;

  this.camera.initialize(gl, canvas);

  // Load shaders
  this.shaders = {};
  this.addShader('flat');
  this.addShader('texture');
  this.addShader('selection-texture-builder');

  gl.cullFace(gl.BACK);
  gl.enable(gl.CULL_FACE);
  gl.clearColor(0.1, 0.1, 0.1, 1.0);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

  this.initialTime = (new Date()).getTime();

  this.selectionRenderer = new Ngl.SelectionRenderer();
  this.selectionRenderer.createSelectionTexture(gl, this, 512, 512); // To test  append: , this.selectionRenderer.validationFunction);

  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
    throw new Error('gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE');
  }

  this.createEventHandlers();
};

Ngl.Scene.prototype.createEventHandlers = function() {
  var _this = this;
  this.canvasElement.on('mouseup mousedown mousemove mouseover mouseout', function(event) {
    var cp = _.cloneDeep(event);
    _this.mouseEvents.push(event);
  });
};

Ngl.Scene.prototype.add = function(obj) {
  this.children.push(obj);
  obj.parent = this;
};

Ngl.Scene.prototype.render = function() {

  var gl = this.gl;

  while(this.mouseEvents.length) {
    var event = this.mouseEvents.shift();
    if(_.isUndefined(event.offsetX)) {
      event.offsetX  = event.clientX - $(event.target).offset().left;
      event.offsetY  = event.clientY - $(event.target).offset().top;
    }
    var _this = this;
    var selectionResult = this.selectionRenderer.getObjectUnderPixel(gl, this, event.offsetX, event.offsetY);
    if(selectionResult.obj) {
      var _event = _.cloneDeep(event);
      var _obj = selectionResult.obj;
      _event.canvasX = selectionResult.canvasX;
      _event.canvasY = selectionResult.canvasY;
      setTimeout(function() {
        _obj.onEvent(_event);
      }, 0);
    }
  }

  this.renderForSelect = false;
  this.renderForSelectColor = false;
  this.renderForSelectTexture = false;

  this.time = (new Date()).getTime() - this.initialTime;

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  /* jshint -W016 */
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  /* jshint +W016 */
  gl.disable(gl.BLEND);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  if(this.camera.cameraTransformUpdated) {
    this.camera.cameraTransformUpdated = false;
    this.transformUpdated = true;
  }

  if(this.transformUpdated) {
    mat4.multiply(this.worldTransform, this.camera.inverseCameraTransform, this.transform);
  }

  for(var i = 0; i<this.children.length; i++) {
    this.children[i].render(gl, this, this);
  }

  this.transformUpdated = false;
};

Ngl.Scene.prototype.setSelectionCallback = function(callback) {
  this.selectionCallback = callback;
};

Ngl.Scene.prototype.addWrObject = function(wrObject) {
  this.wrObjects.push(wrObject);
  wrObject.selectColor = this.wrNextColor.toFloatVector();
  this.wrObjectsByColorHash[this.wrNextColor.toString()] = wrObject;
  this.wrNextColor.increment();
};

Ngl.Scene.prototype.doSelectOnNextRender = function() {
  this.doSelect = true;
};

Ngl.Scene.prototype.setRenderMode = function(mode) {
  switch(mode) {
    case 'canvas':
      this.renderForSelect = false;
      this.renderForSelectColor = false;
      this.renderForSelectTexture = false;
      break;
    case 'color':
      this.renderForSelect = true;
      this.renderForSelectColor = true;
      this.renderForSelectTexture = false;
      break;
    case 'texture':
      this.renderForSelect = true;
      this.renderForSelectColor = false;
      this.renderForSelectTexture = true;
      break;
  }
};

Ngl.Scene.prototype.addShader = function(name) {
  var shader = {};
  shader.vertex   = this.compileShaderFromElement(name+'-vertex-shader');
  shader.fragment = this.compileShaderFromElement(name+'-fragment-shader');
  shader.program  = this.createProgram(shader.vertex, shader.fragment);
  this.shaders[name] = shader;

  if($('#'+name+'-color-select-fragment-shader').length) {
    var colorShader = {};
    colorShader.vertex = shader.vertex;
    colorShader.fragment = this.compileShaderFromElement(name+'-color-select-fragment-shader');
    colorShader.program  = this.createProgram(colorShader.vertex, colorShader.fragment);
    this.shaders[name+'-color-select'] = colorShader;
  }

  if($('#'+name+'-texture-select-fragment-shader').length) {
    var textureShader = {};
    textureShader.vertex = shader.vertex;
    textureShader.fragment = this.compileShaderFromElement(name+'-texture-select-fragment-shader');
    textureShader.program  = this.createProgram(textureShader.vertex, textureShader.fragment);
    this.shaders[name+'-texture-select'] = textureShader;
  }
};

Ngl.Scene.prototype.createProgram = function(vertexShader, fragmentShader) {
  var gl = this.gl;
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  // Check the link status
  var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) {
    var lastError = gl.getProgramInfoLog (program);
    Ngl.Log('Error in program linking:' + lastError);

    gl.deleteProgram(program);
    return null;
  }
  return program;
};

Ngl.Scene.prototype.compileShaderFromElement = function(scriptId) {
  var shaderSource = '';
  var shaderType;
  var shaderScript = document.getElementById(scriptId);
  if (!shaderScript) {
    Ngl.Log('ERROR: Unknown script element ' + scriptId);
    throw('Error: unknown script element ' + scriptId);
  }
  shaderSource = shaderScript.text;

  if (shaderScript.type === 'x-shader/x-vertex') {
    shaderType = this.gl.VERTEX_SHADER;
  } else if (shaderScript.type === 'x-shader/x-fragment') {
    shaderType = this.gl.FRAGMENT_SHADER;
  } else if (shaderType !== this.gl.VERTEX_SHADER && shaderType !== this.gl.FRAGMENT_SHADER) {
    Ngl.Log('ERROR: unknown shader type '+scriptId);
    return null;
  }

  return this.compileShader(shaderSource, shaderType);
};

Ngl.Scene.prototype.compileShader = function(shaderSource, shaderType) {
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
    Ngl.Log('ERROR compiling shader "' + shader + '":' + lastError);
    gl.deleteShader(shader);
    return null;
  }

  return shader;
};

Ngl.powerOfTwo = function(d) {
  var log2 = Math.log(2.0);
  var power = Math.ceil(Math.log(d)/log2);
  return Math.ceil(Math.pow(2.0, power)-0.5);
};

// *** Color utilities ***

Ngl.IntegerColor = function(r, g, b) {
  this.r = _.isUndefined(r) ? 0 : r;
  this.g = _.isUndefined(g) ? 0 : g;
  this.b = _.isUndefined(b) ? 0 : b ;
};

Ngl.IntegerColor.prototype.increment = function() {
  this.b++;
  if(this.b > 255) {
    this.b = 0;
    this.g++;
    if(this.g > 255) {
      this.g = 0;
      this.r++;
    }
  }
};

Ngl.IntegerColor.prototype.isEqual = function(c) {
  return (c.r === this.r && c.g === this.g && c.b === this.b);
};

Ngl.IntegerColor.prototype.toFloatVector = function() {
  return vec4.fromValues(this.r*0.00392156862, this.g*0.00392156862,this.b*0.00392156862, 1.0);
};

Ngl.IntegerColor.prototype.toString = function() {
  return this.r+','+this.g+','+this.b;
};

Ngl.Scaling = { 'unscaled': 0, 'parent': 1, 'screen': 2 };

Ngl.Log = function(msg) {
  window.console.log(msg);
};
