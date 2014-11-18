/**********************************************************************

File     : circular.js
Project  : N Simulator Library
Purpose  : Source file for a circular surface.
Revisions: Original definition by Lawrence Gunn.
           2014/11/03

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

Ngl.Surface.Circular = function() {
//  this.radiusOuter = 250.0;
  this.mat  = new Float32Array(16);
  this.before = mat4.create();
  this.after = mat4.create();
  this.mat[0] = this.radiusOuter;

  this.ivec = new Int32Array(4);

  mat4.rotateZ(this.before, this.before, Ngl.radians(0.0));
  mat4.rotateZ(this.after, this.after, Ngl.radians(0.0));
};

Ngl.Surface.Circular.prototype.configure = function(dock, surface3dConfig) {
  this.config = surface3dConfig;
  this.radiusOuter = parseFloat(this.config.radiusOuter);
  this.mat[0] = this.radiusOuter;
};

/***
 * Configures/sizes the HTML elements prior to rendering them to a canvas. For the circular element this might mean
 * leaving it untouched or it might need to change the width of the top element to match the radius and angle configuration.
 * @method configureHTML
 * @param panel
 * @param host
 * @param top
 */
Ngl.Surface.Circular.prototype.configureHTML = function(panel, host, top) {
  // Cases:
  //   1) radiusOuter and angle defined: stretch the top element width to match.
  //   2) angle defined: work out radiusOuter
  //   3) radiusOuter defined: nothing to do
  var textureInfo = {};
  textureInfo.canvasWidth = top.width();
  textureInfo.canvasHeight = top.height();


  if(!_.isUndefined(this.config.angle) && !_.isUndefined(this.config.radiusOuter)) {
    this.radiusOuter = parseFloat(this.config.radiusOuter);
    if(this.config.angle === 'full') {
      this.angle = 360.0;
    } else {
      this.angle = parseFloat(this.config.angle);
    }
    textureInfo.canvasWidth = 2.0*Math.PI*this.radiusOuter;
  }

  textureInfo.texturemapWidth = Ngl.powerOfTwo(textureInfo.canvasWidth+2*Ngl.CANVAS_MARGIN);
  textureInfo.texturemapHeight = Ngl.powerOfTwo(textureInfo.canvasHeight+2*Ngl.CANVAS_MARGIN);

  textureInfo.canvasTop = Ngl.CANVAS_MARGIN;
  textureInfo.canvasLeft = Ngl.CANVAS_MARGIN;

  host.css('display', 'block').css('width', textureInfo.texturemapWidth+'px').css('height', textureInfo.texturemapHeight+'px'); //.css('background-color', 'green');
  top.css({'display': 'block', 'top': textureInfo.canvasTop+'px', 'left': textureInfo.canvasTop+'px'}).width(textureInfo.canvasWidth).height(textureInfo.canvasHeight);
  return textureInfo;
};


Ngl.Surface.Circular.prototype.attachToShader = function(gl, scene, locations) {
  gl.uniformMatrix4fv(locations.mat, gl.FALSE, this.mat);
  gl.uniformMatrix4fv(locations.before, gl.FALSE, this.before);
  gl.uniformMatrix4fv(locations.after, gl.FALSE, this.after);
  gl.uniform4iv(locations.ivec, this.ivec);
};
