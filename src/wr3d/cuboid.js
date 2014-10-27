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

var Ngl = Ngl || {};

//Ngl.Cuboid = function(width, height, length,  textureNames, textures) {
Ngl.Cuboid = function() {
  Ngl.Dock.call(this);
  this.initialized = false;
};

Ngl.Cuboid.prototype = Object.create(Ngl.Dockprototype);

Ngl.Cuboid.prototype = {
  constructor: Ngl.Cuboid,

  initialize: function(gl, scene, parent) {
    Ngl.Dock.initialize(gl, scene, parent);

    var array = new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0]);
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);

    this.program = scene.simpleShader.program;
    this.positionLocation = gl.getAttribLocation(this.program, 'position');
    this.sizeLocation = gl.getUniformLocation(this.program, 'size');
    this.projectionMatrixLocation = gl.getUniformLocation(this.program, 'projectionMatrix');
    this.surfaceColorLocation = gl.getUniformLocation(this.program, 'surfaceColor');
  },

  render: function(gl, scene, parent) {
    if(parent.transformUpdated || this.transformUpdated) {
      mat4.multiply(this.worldTransform, parent.worldTransform,  this.transform);
      mat4.multiply(this.projectionModelView, scene.camera.projectionMatrix, this.worldTransform);
    }

    gl.useProgram(this.program);
    gl.uniform1f(this.sizeLocation, this.size);
    gl.uniformMatrix4fv(this.projectionMatrixLocation, gl.FALSE, this.projectionModelView);
    gl.uniform4fv(this.surfaceColorLocation, scene.renderForSelect ? this.selectColor : this.color);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

    // Where the vertex data needs to go.
    gl.enableVertexAttribArray(this.positionLocation);
    gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, gl.FALSE, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
};
