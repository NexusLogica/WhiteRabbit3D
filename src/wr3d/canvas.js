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
};

Ngl.HtmlCanvas.nextCanvasElementNum = 0;

Ngl.HtmlCanvas.prototype.load = function(gl) {
  var _this = this;
  var deferred = $.Deferred();

  if(this.config.host) {
    this.host = $(this.config.host);
    this.top = $(this.host.children().get(0));

    this.sizeElements(this.host, this.top);


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

Ngl.HtmlCanvas.prototype.onEvent = function(event) {
  var elAndPos = this.findElementUnderXyPosition(event.wr.targetX, event.wr.targetY);

  switch(event.type) {
    case 'click':
    case 'mousedown':
    case 'mouseup':
    case 'mousemove':
    case 'mouseout':
    case 'mouseover':
      var ec = jQuery.Event( event.type, { clientX: elAndPos.clientX, clientY: elAndPos.clientY, button: 0 } );
      elAndPos.target.trigger(ec);
      Ngl.log("event: "+event.type)
      break;
  }
};

Ngl.HtmlCanvas.prototype.findElementUnderXyPosition = function(xPanel, yPanel) {
  var element = this.top.get(0);
  var x = xPanel;
  var y = yPanel;
  while(element) {
    x += (element.offsetLeft - element.scrollLeft + element.clientLeft);
    y += (element.offsetTop - element.scrollTop + element.clientTop);
    element = element.offsetParent;
  }
  var targetElement = document.elementFromPoint(x, y);
  return { target: $(targetElement), x: x, y: y };
};

Ngl.HtmlCanvas.prototype.getPageXyPosition = function(event) {
  var x = event.canvasX;
  var y = event.canvasY;
  var element = this.top.get(0);
  while(element) {
      x += (element.offsetLeft - element.scrollLeft + element.clientLeft);
      y += (element.offsetTop - element.scrollTop + element.clientTop);
      element = element.offsetParent;
  }
  return { x: x, y: y };
};

Ngl.HtmlCanvas.prototype.hasCanvas = function() {
  return this.canvasInitialized;
};

Ngl.HtmlCanvas.prototype.getCanvasElement = function() {
  return this.canvasElement;
};
