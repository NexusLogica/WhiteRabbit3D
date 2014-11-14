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

Ngl.Canvas = function(config, panel) {
  this.config = config;
  this.canvasInitialized = false;
  this.panel = panel;
  this.updateRequired = false;
};

Ngl.Canvas.nextCanvasElementNum = 0;

Ngl.Canvas.prototype = {

  load: function(gl) {
    var _this = this;
    var deferred = $.Deferred();

    if(this.config.host) {
      var host = $(this.config.host);
      var top = $(host.children().get(0));

      this.sizeElements(host, top);


      html2canvas(host.get(0), {
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
  },

  sizeElements: function(host, top) {
    var primarySurface = this.panel.surfaces[0];
    var texturemapInfo = primarySurface.configureHTML(this, host, top);
    _.assign(this, texturemapInfo);
  },

  createTexturemap: function(gl, image) {
    this.texture = gl.createTexture();
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
  },

  bindTexturemap: function(gl) {
    if(this.texture) {
      gl.activeTexture(gl.TEXTURE0+0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);

      var required = this.getUpdateRequired();
      if(required) {


        gl.texSubImage2D(gl.TEXTURE_2D, 0, region.x, region.y, gl.RGBA, gl.UNSIGNED_BYTE, canvasX);
        gl.generateMipmap(gl.TEXTURE_2D);
      }
    }
  },

  getUpdateRequired: function() {
    return this.updateRequired;
  },

  setUpdateRequired: function(required) {
    this.updateRequired = required;
  },

  onEvent: function(event) {
    var pageXY = this.getPageXyPosition(event);
    switch(event.type) {
      // Don't pass clicks to Zebkit.
      case 'mousedown':
      case 'mouseup':
      case 'mousemove':
      case 'mouseout':
      case 'mouseover':
        var ec = jQuery.Event( event.type, { pageX: pageXY.x, pageY: pageXY.y, button: 0 } );
        this.canvasElement.trigger(ec);
        break;
    }
  },

  getPageXyPosition: function(event) {
    var x = event.canvasX;
    var y = event.canvasY;
    var element = this.canvasElement.get(0);
    while(element) {
        x += (element.offsetLeft - element.scrollLeft + element.clientLeft);
        y += (element.offsetTop - element.scrollTop + element.clientTop);
        element = element.offsetParent;
    }
    return { x: x, y: y };
  },

  powerOfTwo: function(d) {
    var log2 = Math.log(2.0);
    var power = Math.ceil(Math.log(d)/log2);
    return Math.ceil(Math.pow(2.0, power)-0.5);
  },

  createHtmlCanvas: function(gl) {
      var data = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">' +
                 '<foreignObject width="100%" height="100%">' +
                 '<div xmlns="http://www.w3.org/1999/xhtml" style="font-size:40px">' +
                   '<em>I</em> like' +
                   '<span style="color:white; text-shadow:0 0 2px blue;">' +
                   'cheese</span>' +
                 '</div>' +
                 '</foreignObject>' +
                 '</svg>';

      var DOMURL = window.URL || window.webkitURL || window;

      var img = new Image();
      var svg = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
      var url = DOMURL.createObjectURL(svg);

      var _this = this;
      img.onload = function () {
//    var canvas = $(".canvas-raster").get(0);
//      var ctx = canvas.getContext('2d');
//ctx.drawImage(img, 0, 0);
         _this.createTexturemap(gl, img);


        DOMURL.revokeObjectURL(url);
      };

      img.src = url;
/*
    var canvas = $(".canvas-raster").get(0);
    var html_container = document.getElementById("thehtml");
    var html = html_container.innerHTML;

    rasterizeHTML.drawHTML(html, canvas);
*/
  },

  hasCanvas : function() {
//    return !_.isUndefined(this.canvas);
    return this.canvasInitialized;
  },

  getCanvasElement: function() {
    return this.canvasElement;
  }
};
