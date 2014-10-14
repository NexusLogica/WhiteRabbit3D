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

Ngl.Canvas = function(element, layoutJsonUrl, width, height) {
  this.canvasElement = $(element);
  this.layoutJsonUrl = layoutJsonUrl;
  this.width = width;
  this.height = height;
  this.canvasInitialized = false;
};

Ngl.Canvas.prototype = {

  build: function() {
    var _this = this;
    zebra()["zebra.json"] = "../src/lib/bower_components/zebra/zebra.json";
    zebra.ready(function() {
      _this.texturemapWidth = _this.powerOfTwo(_this.width);
      _this.texturemapHeight = _this.powerOfTwo(_this.height);

      _this.canvas = new zebra.ui.zCanvas(_this.canvasElement.get(0), _this.texturemapWidth, _this.texturemapHeight);

      _this.canvasElement.width(_this.texturemapWidth).height(_this.texturemapHeight);

      _this.canvas.root.load(_this.layoutJsonUrl);

      setTimeout(function() {
        _this.canvasInitialized = true;
      }, 1);
    });
  },

  setTexturemapObject: function(textmap) {
    this.texturemapObject = textmap;
  },

  powerOfTwo: function(d) {
    var log2 = Math.log(2.0);
    var power = Math.ceil(Math.log(d)/log2);
    return Math.ceil(Math.pow(2.0, power)-0.5);
  },

  hasCanvas : function() {
//    return !_.isUndefined(this.canvas);
    return this.canvasInitialized;
  },

  getCanvasElement: function() {
    return this.canvasElement;
  }
};
