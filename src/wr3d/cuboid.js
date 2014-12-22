/**********************************************************************

File     : cuboid.js
Project  : N Simulator Library
Purpose  : Source file for a field viewer settings component.
Revisions: Original definition by Lawrence Gunn.
           2014/09/23

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

Ngl.Cuboid = function(config) {
  Ngl.WrDock.call(this, config);
  this.initialized = false;
  this.size = 10.0;
  this.pixelSize = 1.0;
  this.metric = 'px';
  this.surfaceColor = vec4.fromValues(1.0, 0.0, 0.0, 1.0);
};

Ngl.Cuboid.prototype = Object.create(Ngl.WrDock.prototype);

Ngl.Cuboid.prototype.constructor = Ngl.Cuboid;

Ngl.Cuboid.prototype.initialize = function(gl, scene) {
  Ngl.WrDock.prototype.initialize.call(this, gl, scene);

  var array = new Float32Array([
    -1.0,  1.0,  1.0,  // 0
    -1.0,  1.0, -1.0,  // 1
    -1.0, -1.0,  1.0,  // 2
    -1.0, -1.0, -1.0,  // 3
     1.0, -1.0,  1.0,  // 4
     1.0, -1.0, -1.0,  // 5
     1.0,  1.0,  1.0,  // 6
     1.0,  1.0, -1.0   // 7
  ]);

  this.buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
  gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);

  var numIndices = 48;
  var indexData = new Uint16Array(
    [
      // +/- z
      0, 2, 4,
      4, 6, 0,
      1, 5, 3,
      1, 7, 5,

      // +/- x
      6, 4, 5,
      5, 7, 6,
      1, 3, 2,
      2, 0, 1,

      // +/- y
      1, 0, 6,
      6, 7, 1,
      4, 2, 3,
      5, 4, 3
    ]
  );

  this.numIndices = 36;
  this.indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, gl.STATIC_DRAW);

  this.program = scene.shaders.flat.program;
  this.positionLocation = gl.getAttribLocation(this.program, 'position');
  this.sizeLocation = gl.getUniformLocation(this.program, 'size');
  this.pixelSizeLocation = gl.getUniformLocation(this.program, 'pixelSize');
  this.projectionViewMatrixLocation = gl.getUniformLocation(this.program, 'projectionViewMatrix');
  this.surfaceColorLocation = gl.getUniformLocation(this.program, 'surfaceColor');
};

Ngl.Cuboid.prototype.configureFromStyles = function(gl, scene) {
  Ngl.WrDock.prototype.configureFromStyles.call(this, gl, scene);

  this.config.objectConfig = Ngl.parseBracketedStyle(this.config['-wr3d-object3d']);
  if(this.config.objectConfig.hasOwnProperty('size')) {
    var sizeObj = Ngl.floatAndUnitFromString(this.config.objectConfig.size);
    if(sizeObj) {
      this.size = sizeObj.value;
      if(sizeObj.units === 'sp') {
        this.metric = 'sp';
        this.pixelSize = 1.0;
      } else {
        this.metric = 'px';
      }
    }
  }
};

Ngl.Cuboid.prototype.render = function(gl, scene, parent) {

  this.preRender(gl, scene);

  gl.useProgram(this.program);
  gl.uniform1f(this.sizeLocation, this.size);
  gl.uniform1f(this.pixelSizeLocation, this.pixelSize);
  gl.uniformMatrix4fv(this.projectionViewMatrixLocation, gl.FALSE, this.projectionViewTransform);
  /////////gl.uniform4fv(this.surfaceColorLocation, scene.renderForSelect ? this.selectColor : this.color);
  gl.uniform4fv(this.surfaceColorLocation, this.surfaceColor);

  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

  // Where the vertex data needs to go.
  gl.enableVertexAttribArray(this.positionLocation);
  gl.vertexAttribPointer(this.positionLocation, 3, gl.FLOAT, gl.FALSE, 12, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);

  this.postRender(gl, scene);
};

