/**********************************************************************

File     : rectangular-surface.js
Project  : N Simulator Library
Purpose  : Source file for a rectangular surface.
Revisions: Original definition by Lawrence Gunn.
           2014/09/23

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

Ngl.RectangularSurface = function(width, height, texture) {
  Ngl.Dock.call(this);
  this.width = width;
  this.height = height;
};

Ngl.RectangularSurface.prototype = Object.create(Ngl.Dock.prototype);

Ngl.RectangularSurface.prototype = {
  constructor: Ngl.RectangularSurface,

  initialize: function(gl, scene, parent) {
    Ngl.Dock.prototype.initialize.call(this, gl, scene, parent);

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

    this.color = vec4.fromValues(1, 0, 0, 1);
    this.selectColor = vec4.fromValues(0, 0, 1, 1);

    this.program = scene.simpleShader.program;
    this.positionLocation = gl.getAttribLocation(this.program, 'position');
    this.sizeLocation = gl.getUniformLocation(this.program, 'size');
    this.projectionMatrixLocation = gl.getUniformLocation(this.program, 'projectionMatrix');
    this.surfaceColorLocation = gl.getUniformLocation(this.program, 'surfaceColor');
  },

  render: function(gl, scene, parent) {
    Ngl.Dock.prototype.preRender.call(this, gl, scene, parent);

    gl.useProgram(this.program);
    gl.uniform1f(this.sizeLocation, this.width);
    gl.uniformMatrix4fv(this.projectionMatrixLocation, gl.FALSE, this.projectionModelView);
    gl.uniform4fv(this.surfaceColorLocation, scene.renderForSelect ? this.selectColor : this.color);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

    // Where the vertex data needs to go.
    gl.enableVertexAttribArray(this.positionLocation);
    gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, gl.FALSE, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    Ngl.Dock.prototype.postRender.call(this, gl, scene, parent);
  }
};
