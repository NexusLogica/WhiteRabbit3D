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

    this.width = 512;//this.texture.width;
    this.height = 512;//this.texture.height;

    var w2 = this.width/2.0;
    var h2 = this.height/2.0;
   // var scale = 0.004;
    var scale = 0.002;
    w2 *= scale;
    h2 *= scale;
    this.size = new Float32Array([w2, h2]);

    //var tmw = this.width/this.texture.texturemapWidth;
    //var tmh = 1.0-this.height/this.texture.texturemapHeight;

    var tmw = 1.0;
    var tmh = 0.0;
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

    // The main shader and its locations.
    this.program = scene.shaders.texture.program;
    this.positionLocation = gl.getAttribLocation(this.program, 'position');
    this.sizeLocation = gl.getUniformLocation(this.program, 'size');
    this.projectionMatrixLocation = gl.getUniformLocation(this.program, 'projectionViewMatrix');
    this.textureLocation = gl.getAttribLocation(this.program, 'texCoord');

    // The color select shader and its locations.
    this.selectColorProgram = scene.shaders['texture-color-select'].program;
    this.positionLocationCs = gl.getAttribLocation(this.selectColorProgram, 'position');
    this.sizeLocationCs = gl.getUniformLocation(this.selectColorProgram, 'size');
    this.projectionMatrixLocationCs = gl.getUniformLocation(this.selectColorProgram, 'projectionViewMatrix');
    this.surfaceColorLocationCs = gl.getUniformLocation(this.selectColorProgram, 'surfaceColor');

    // The color select shader and its locations.
    this.selectTextureProgram = scene.shaders['texture-texture-select'].program;
    this.positionLocationTs = gl.getAttribLocation(this.selectTextureProgram, 'position');
    this.sizeLocationTs = gl.getUniformLocation(this.selectTextureProgram, 'size');
    this.projectionMatrixLocationTs = gl.getUniformLocation(this.selectTextureProgram, 'projectionViewMatrix');
    this.textureLocationTs = gl.getAttribLocation(this.selectTextureProgram, 'texCoord');

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

    var renderType = '';
    if(scene.renderForSelectColor) {
      renderType = 'Cs';
      gl.useProgram(this.selectColorProgram);
      gl.uniform4fv(this.surfaceColorLocationCs, this.selectColor);

    } else if(scene.renderForSelectTexture) {
      renderType = 'Ts';

      gl.activeTexture(gl.TEXTURE0+0);
      gl.bindTexture(gl.TEXTURE_2D, scene.selectionRenderer.selectionTexture);
      gl.useProgram(this.selectTextureProgram);

    } else {
      this.texture.bindTexture(gl);
      gl.useProgram(this.program);

      // Only update during regular render cycles.
      if(parent.transformUpdated || this.transformUpdated) {
        mat4.multiply(this.worldTransform, parent.worldTransform,  this.transform);
        mat4.multiply(this.projectionModelView, scene.projectionMatrix, this.worldTransform);
      }
    }


    gl.uniformMatrix4fv(this['projectionMatrixLocation'+renderType], gl.FALSE, this.projectionModelView);
    gl.uniform2fv(this['sizeLocation'+renderType], this.size);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

    // Where the vertex data needs to go.
    gl.enableVertexAttribArray(this['positionLocation'+renderType]);
    gl.enableVertexAttribArray(this['textureLocation'+renderType]);

    gl.vertexAttribPointer(this['positionLocation'+renderType], 2, gl.FLOAT, gl.FALSE, 16, 0);
    gl.vertexAttribPointer(this['textureLocation'+renderType],  2, gl.FLOAT, gl.FALSE, 16, 8);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    Ngl.Dock.prototype.postRender.call(this, gl, scene, parent);
  }
};
