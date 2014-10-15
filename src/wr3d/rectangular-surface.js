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
  this.texture = texture;
};

Ngl.RectangularSurface.prototype = Object.create(Ngl.Dock.prototype);

Ngl.RectangularSurface.prototype = {
  constructor: Ngl.RectangularSurface,

  initialize: function(gl, scene, parent) {
    Ngl.Dock.prototype.initialize.call(this, gl, scene, parent);

    this.width = this.texture.width;
    this.height = this.texture.height;

    var w2 = this.width/2.0;
    var h2 = this.height/2.0;
    var scale = 0.004;
    w2 *= scale;
    h2 *= scale;
    this.size = new Float32Array([w2, h2]);

    var tmw = this.width/this.texture.texturemapWidth;
    var tmh = 1.0-this.height/this.texture.texturemapHeight;

    var d = 0.1*this.width;
    var array = new Float32Array([
        -1.0, -1.0, 0.0, tmh,
         1.0, -1.0, tmw, tmh,
        -1.0,  1.0, 0.0, 1.0,
        -1.0,  1.0, 0.0, 1.0,
         1.0, -1.0, tmw, tmh,
         1.0,  1.0, tmw, 1.0]);

    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);

    this.color = vec4.fromValues(1, 0, 0, 1);
    this.selectColor = vec4.fromValues(0, 0, 1, 1);

    this.program = scene.textureShader.program;
    this.positionLocation = gl.getAttribLocation(this.program, 'position');
    this.sizeLocation = gl.getUniformLocation(this.program, 'size');
    this.projectionMatrixLocation = gl.getUniformLocation(this.program, 'projectionViewMatrix');
    this.textureLocation = gl.getAttribLocation(this.program, 'texCoord');
  },

  render: function(gl, scene, parent) {
    if(!this.initialized) {
      if(this.texture.initialize(gl)) {
        this.initialize(gl, scene, parent);
      } else {
        return;
      }
    }

    Ngl.Dock.prototype.preRender.call(this, gl, scene, parent);

    this.texture.bindTexture(gl);



//    if(parent.transformUpdated || this.transformUpdated) {
      mat4.multiply(this.worldTransform, parent.worldTransform,  this.transform);
      mat4.multiply(this.projectionModelView, scene.projectionMatrix, this.worldTransform);
//    }

    gl.useProgram(this.program);
    gl.uniformMatrix4fv(this.projectionMatrixLocation, gl.FALSE, this.projectionModelView);
    gl.uniform2fv(this.sizeLocation, this.size);
//    gl.uniform4fv(this.surfaceColorLocation, scene.renderForSelect ? this.selectColor : this.color);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

    // Where the vertex data needs to go.
    gl.enableVertexAttribArray(this.positionLocation);
    gl.enableVertexAttribArray(this.textureLocation);

    gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, gl.FALSE, 16, 0);
    gl.vertexAttribPointer(this.textureLocation,  2, gl.FLOAT, gl.FALSE, 16, 8);

        gl.vertexAttribPointer(this.sizeLocation, 2, gl.FLOAT, gl.FALSE, 16, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    Ngl.Dock.prototype.postRender.call(this, gl, scene, parent);
  }
};
