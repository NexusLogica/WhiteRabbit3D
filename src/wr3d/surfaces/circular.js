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
  Ngl.Surface.SurfaceMorph.call(this);
  this.shaders = [ Ngl.Surface.Shaders.CIRCULAR ];
};

Ngl.Surface.Circular.prototype = Object.create(Ngl.Surface.SurfaceMorph.prototype);

Ngl.Surface.Circular.prototype.style = function(surface3dConfig) {
  if(arguments.length === 0) {
    return this.config;
  } else {
    this.config = surface3dConfig;

    this.parseBeforeAfter();

    this.radiusOuterType = 'auto';
    var r = this.config['radius-outer'];
    if(!_.isUndefined(r)) {
      if(isNaN(parseFloat(r))) {
        this.radiusOuterType = r;
      } else {
        this.radiusOuterType = 'provided';
        this.radiusOuter = parseFloat(r);
      }
    }

    this.radiusInnerType = 'auto';
    r = this.config['radius-inner'];
    if(!_.isUndefined(r)) {
      if(isNaN(parseFloat(r))) {
        this.radiusInnerType = r;
      } else {
        this.radiusInnerType = 'provided';
        this.radiusInner = parseFloat(r);
      }
    }

    this.angle = _.isUndefined(this.config.angle) ? 'auto' : this.config.angle === 'full' ? 360.0 : parseFloat(this.config.angle);

    this.mat[0] = this.radiusOuter;
  }
};

Ngl.Surface.Circular.prototype.configureData = function() {
  // Cases:
  //   1) radius-outer and angle defined: stretch the width of element to match.
  //   2) radius-inner and angle defined: stretch the top element width to match.
  //   3) angle defined: work out radiusOuter
  //   4) radiusOuter defined: calculate angle
  //   5) radiusInner defined: calculate angle
  //   6) radiusInner and radiusOuter defined: calculate angle and scaling
  if(this.radiusOuterType === 'provided') {

  }

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
  var textureInfo = {};
  textureInfo.canvasWidth = top.width();
  textureInfo.canvasHeight = top.height();

  if(this.radiusOuterType === 'full' || this.angle === 360.0) {
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

Ngl.Surface.Circular.prototype.attachToShader = function(gl, scene, locations, indexOfNextLocationToUse) {
  var location = locations[indexOfNextLocationToUse];
  gl.uniformMatrix4fv(location.mat, gl.FALSE, this.mat);
  gl.uniformMatrix4fv(location.before, gl.FALSE, this.before);
  gl.uniformMatrix4fv(location.after, gl.FALSE, this.after);
  gl.uniform4iv(location.ivec, this.ivec);
  return 1; // return the number of locations actually used.
};

Ngl.Surface.Circular.prototype.fillInstructions = function(instructions, nextInstructionIndex) {
  instructions[nextInstructionIndex] = 2;
  return 1; // return the number of instructions actually used.
};
