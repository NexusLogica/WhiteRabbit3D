/**********************************************************************

File     : canvas.js
Project  : N Simulator Library
Purpose  : Source file for a canvas surface.
Revisions: Original definition by Lawrence Gunn.
           2014/10/01

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

Ngl.HtmlCanvas = function(config, panel) {
  this.config = config;
  this.canvasInitialized = false;
  this.panel = panel;
  this.updateRequired = false;
  this.mouseOverElements = [];
};

Ngl.HtmlCanvas.nextCanvasElementNum = 0;

Ngl.HtmlCanvas.prototype.load = function(gl) {
  var _this = this;
  var deferred = $.Deferred();

  if(this.config.host) {
    this.host = $(this.config.host);
    this.top = $(this.host.children().get(0));

    this.sizeElements(this.host, this.top);
    this.buildLayoutTree();

    html2canvas(this.host.get(0), {
      //background: undefined,
      onrendered: function(canvas) {
        var element = $('.html2canvas-canvas').get(0);
        element.appendChild(canvas);
        _this.createTexturemap(gl, canvas);
        deferred.resolve();
      },
      onclone: function(element) {
//          $(element).find('.html2canvas-container').css('background-color', 'green').css('top', '0px');
      }
    });
  }
  return deferred;
};

Ngl.HtmlCanvas.prototype.sizeElements = function() {
  var primarySurface = this.panel.surfaces[0];
  var texturemapInfo = primarySurface.configureHTML(this, this.host, this.top);
  _.assign(this, texturemapInfo);
};

Ngl.HtmlCanvas.prototype.createTexturemap = function(gl, image) {
  this.texture = gl.createTexture();
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.bindTexture(gl.TEXTURE_2D, this.texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, null);
};

Ngl.HtmlCanvas.prototype.bindTexturemap = function(gl) {
  if(this.texture) {
    gl.activeTexture(gl.TEXTURE0+0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    var required = this.getUpdateRequired();
    if(required) {
      gl.texSubImage2D(gl.TEXTURE_2D, 0, region.x, region.y, gl.RGBA, gl.UNSIGNED_BYTE, canvasX);
      gl.generateMipmap(gl.TEXTURE_2D);
    }
  }
};

Ngl.HtmlCanvas.prototype.getUpdateRequired = function() {
  return this.updateRequired;
};

Ngl.HtmlCanvas.prototype.setUpdateRequired = function(required) {
  this.updateRequired = required;
};

Ngl.HtmlCanvas.prototype.onEvent = function(scene, event) {
  var hitTest = this.findElementUnderXyPosition(scene, event.wr.targetX, event.wr.targetY);

  switch(event.type) {
    case 'click':
    case 'mousedown':
    case 'mouseup':
    case 'mousemove':
    case 'mouseout':
    case 'mouseover':
      var ec = jQuery.Event( event.type, { clientX: hitTest.targetX, clientY: hitTest.targetY, button: 0 } );
      hitTest.target.trigger(ec);
      break;
  }
};

Ngl.HtmlCanvas.prototype.findElementUnderXyPosition = function(scene, x, y) {
  var mouseOvers = [];
  var target = this.layoutTree.findTarget(x, y, mouseOvers);

  var leaving = _.xor(this.mouseOverElements, mouseOvers);
  _.forEach(leaving, function(layout) {
    scene.addEvent('mouseenter', layout.element, x, y);
  });

  var entering = _.without(this.mouseOverElements, mouseOvers);
  _.forEach(leaving, function(layout) {
    scene.addEvent('mouseleave', layout.element, x, y);
  });

  this.mouseOverElements = mouseOvers;
  return { target: $(target.element), canvasX: x, canvasY: y, targetX: x-target.x, targetY: y-target.y };
};

Ngl.HtmlCanvas.prototype.buildLayoutTree = function() {
  this.layoutTree = new Ngl.LayoutTree(this.top.get(0), 0, 0);
};

Ngl.HtmlCanvas.prototype.hasCanvas = function() {
  return this.canvasInitialized;
};

Ngl.HtmlCanvas.prototype.getCanvasElement = function() {
  return this.canvasElement;
};
