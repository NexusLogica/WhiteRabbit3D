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

Ngl.Texturemap = function(canvasObject) {
  this.canvasObject = canvasObject;
  this.initialized = false;
}

Ngl.Texturemap.prototype = {
  initialize: function(gl) {
    if(this.canvasObject.hasCanvas()) {
      this.initialized = true;

      this.texture = gl.createTexture();
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.canvasObject.getCanvasElement().get(0));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.bindTexture(gl.TEXTURE_2D, null);
    }
  },

  bindTexture: function(gl) {

    if(!this.initialized) {
      this.initialize(gl);
    }

    if(this.texture) {
      gl.activeTexture(gl.TEXTURE0+0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
    }
  }
};
