/**********************************************************************

File     : selection-renderer.js
Project  : N Simulator Library
Purpose  : Source file for a selection renderer object.
Revisions: Original definition by Lawrence Gunn.
           2014/10/16

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

Ngl.SelectionRenderer = function() {
  this.width  = 1024;
  this.height = 1024;
  this.c0 = 256;
  this.c1 = 256*this.c0;
};

Ngl.SelectionRenderer.prototype = {
  setMaxSize: function(width, height) {
    this.width  = width;
    this.height = height;
  },

  getIntColorFromXY: function(x, y) {
    var l = this.toLinearFromXY(x, y);
    var c = this.toIntColorFromLinear(l);

    return c;
  },

  getXYFromIntColor: function(r, g, b) {
    var l = this.toLinearFromIntColor(r, g, b);
    var xy = this.toXYFromLinear(l);
    return xy;
  },

  toLinearFromXY: function(x, y) {
    var l = y*this.width+x;
    return l;
  },

  toXYFromLinear: function(l) {
    var y = Math.floor(l/this.width);
    var x = l % this.width;

    return { x: x, y: y };
  },

  toIntColorFromLinear: function(l) {
    var r = Math.floor(l/this.c1);
    var g = Math.floor((l-r*this.c1)/this.c0);
    var b = l-r*this.c1-g*this.c0;
    return { r: r, g: g, b: b };
  },

  toLinearFromIntColor: function(r, g, b) {
    var l = r*this.c1+g*this.c0+b;
    return l;
  }
};
