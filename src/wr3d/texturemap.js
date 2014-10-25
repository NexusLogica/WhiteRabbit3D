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

Ngl.Texturemap = function(canvasObject) {
  this.canvasObject = canvasObject;
  this.initialized = false;
};

Ngl.Texturemap.prototype = {
  initialize: function(gl) {
    if(this.canvasObject.hasCanvas()) {
      this.initialized = true;

      this.width = this.canvasObject.width;
      this.height = this.canvasObject.height;
      this.texturemapWidth = this.canvasObject.texturemapWidth;
      this.texturemapHeight = this.canvasObject.texturemapHeight;

      this.texture = gl.createTexture();
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.canvasObject.getCanvasElement().get(0));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.bindTexture(gl.TEXTURE_2D, null);

      return true;
    }
    return false;
  },

  bindTexture: function(gl) {

    if(!this.initialized) {
      this.initialize(gl);
    }

    if(this.texture) {
      gl.activeTexture(gl.TEXTURE0+0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);

      var region = this.canvasObject.getUpdateRegion();
      if(region) {
        gl.texSubImage2D(gl.TEXTURE_2D, 0, region.x, region.y, gl.RGBA, gl.UNSIGNED_BYTE, this.canvasObject.getCanvasElement().get(0));
        gl.generateMipmap(gl.TEXTURE_2D);
      }
    }
  }
};
