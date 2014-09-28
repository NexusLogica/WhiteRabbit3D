/**********************************************************************

File     : texturemap.js
Project  : N Simulator Library
Purpose  : Source file for a base texturemap component.
Revisions: Original definition by Lawrence Gunn.
           2014/09/20

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var Ngl = Ngl || {};

Ngl.Texturemap = function(canvas) {
  this.canvasElement = $(canvas);
  this.initialized = false;
}

Ngl.Texturemap.prototype = {
  initialize: function(gl) {
    this.initialized = true;
    this.width  = this.canvasElement.width();
    this.height = this.canvasElement.height();

    // Work out the texture map size (integer power of 2).
    var log2 = Math.log(2.0);
    var power = Math.ceil(Math.log(this.width)/log2);
    this.potWidth = Math.ceil(Math.pow(2.0, power)-0.5);

    power = Math.ceil(Math.log(this.height)/log2);
    this.potHeight = Math.ceil(Math.pow(2.0, power)-0.5);

    this.texture = gl.createTexture();
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.canvasElement.get(0));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
  },

  bindTexture: function(gl) {

    if(!this.initialized) {
      this.initialize(gl);
    }

    gl.activeTexture(gl.TEXTURE0+0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
  }
};
