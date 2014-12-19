/**********************************************************************

File     : rectangular.js
Project  : N Simulator Library
Purpose  : Source file for a rectangular surface.
Revisions: Original definition by Lawrence Gunn.
           2014/11/20

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

Ngl.Surface.Rectangular = function() {
//  this.radiusOuter = 250.0;
  this.mat  = new Float32Array(16);
  this.before = mat4.create();
  this.after = mat4.create();
  this.scaleX = 1.0;
  this.scaleY = 1.0;
  this.mat[0] = this.scaleX;
  this.mat[1] = this.scaleY;

  this.ivec = new Int32Array(4);

  mat4.rotateZ(this.before, this.before, Ngl.radians(0.0));
  mat4.rotateZ(this.after, this.after, Ngl.radians(0.0));
};

Ngl.Surface.Rectangular.prototype.configure = function(dock, surface3dConfig) {
  this.config = surface3dConfig;
};

/***
 * Configures/sizes the HTML elements prior to rendering them to a canvas. For the Rectangular element this might mean
 * leaving it untouched or it might need to change the width of the top element to match the radius and angle configuration.
 * @method configureHTML
 * @param panel
 * @param host
 * @param top
 */
Ngl.Surface.Rectangular.prototype.configureHTML = function(panel, host, top) {
  // Cases:
  //   1) radiusOuter and angle defined: stretch the top element width to match.
  //   2) angle defined: work out radiusOuter
  //   3) radiusOuter defined: nothing to do
  var textureInfo = {};
  textureInfo.canvasWidth = top.width();
  textureInfo.canvasHeight = top.height();

  if(this.config.hasOwnProperty('scale-x')) {
    this.scaleX = parseFloat(this.config['scale-x']);
    this.mat[0] = this.scaleX;
  }

  if(this.config.hasOwnProperty('scale-y')) {
    this.scaleY = parseFloat(this.config['scale-y']);
    this.mat[1] = this.scaleY;
  }

  textureInfo.texturemapWidth = Ngl.powerOfTwo(textureInfo.canvasWidth+2*Ngl.CANVAS_MARGIN);
  textureInfo.texturemapHeight = Ngl.powerOfTwo(textureInfo.canvasHeight+2*Ngl.CANVAS_MARGIN);

  textureInfo.canvasTop = Ngl.CANVAS_MARGIN;
  textureInfo.canvasLeft = Ngl.CANVAS_MARGIN;

  host.css('display', 'block').css('width', textureInfo.texturemapWidth+'px').css('height', textureInfo.texturemapHeight+'px'); //.css('background-color', 'green');
  top.css({'display': 'block', 'top': textureInfo.canvasTop+'px', 'left': textureInfo.canvasTop+'px'}).width(textureInfo.canvasWidth).height(textureInfo.canvasHeight);
  return textureInfo;
};


Ngl.Surface.Rectangular.prototype.attachToShader = function(gl, scene, locations) {
  gl.uniformMatrix4fv(locations.mat, gl.FALSE, this.mat);
  gl.uniformMatrix4fv(locations.before, gl.FALSE, this.before);
  gl.uniformMatrix4fv(locations.after, gl.FALSE, this.after);
  gl.uniform4iv(locations.ivec, this.ivec);
};

Ngl.Surface.Rectangular.prototype.translate = function(trans, pixSizes) {

};
