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
  Ngl.Surface.SurfaceMorph.call(this);
  this.shaders = [ Ngl.Surface.Shaders.RECTANGULAR ];
  this.mat[0] = 1.0;
  this.mat[1] = 1.0;
  this.mat[2] = 1.0;
  this.surfaceTransform = new Ngl.Surface.RectangularTransform();
};

Ngl.Surface.Rectangular.prototype = Object.create(Ngl.Surface.SurfaceMorph.prototype);

Ngl.Surface.Rectangular.prototype.style = function(surface3dConfig) {
  this.config = surface3dConfig;

  this.parseBeforeAfter();
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

