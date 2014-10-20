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
  this.selectionTexture = null;
  this.width  = 1024;
  this.height = 1024;

  this.c0 = 256;
  this.c1 = 256*this.c0;
};

Ngl.SelectionRenderer.prototype = {

  createSelectionTexture: function(gl, scene, width, height, testFunction) {
    this.width  = !_.isUndefined(width)  ? Ngl.powerOfTwo(width)  : this.width;
    this.height = !_.isUndefined(height) ? Ngl.powerOfTwo(height) : this.height;

    this.selectionTexture = gl.createTexture();
    var framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    framebuffer.width  = this.width;
    framebuffer.height = this.height;

    gl.bindTexture(gl.TEXTURE_2D, this.selectionTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, framebuffer.width, framebuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    var renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, framebuffer.width, framebuffer.height);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.selectionTexture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

    // Render
    gl.viewport(0, 0, framebuffer.width, framebuffer.height);
    gl.clearColor(0.0, 0.0, 1.0, 1.0);
    /* jshint -W016 */
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    /* jshint +W016 */
    gl.disable(gl.BLEND);

    var program = scene.shaders['selection-texture-builder'].program;
    gl.useProgram(program);
    var positionLocation = gl.getAttribLocation(program, 'position');
    var incrementLocation = gl.getAttribLocation(program, 'increment');
    var widthLocation = gl.getUniformLocation(program, 'width');

    var vertexData = [
      1.0,  1.0, 1.0, 1.0,
     -1.0,  1.0, 0.0, 1.0,
     -1.0, -1.0, 0.0, 0.0,
      1.0,  1.0, 1.0, 1.0,
     -1.0, -1.0, 0.0, 0.0,
      1.0, -1.0, 1.0, 0.0
    ];

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(positionLocation);
    gl.enableVertexAttribArray(incrementLocation);

    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, gl.FALSE, 16, 0);
    gl.vertexAttribPointer(incrementLocation,  2, gl.FLOAT, gl.FALSE, 16, 8);
    gl.uniform1f(widthLocation, this.width);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    if(!_.isUndefined(testFunction)) {
      testFunction(gl, this.width, this.height);
    }

    // We are done. Clear the buffer info.
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  },

  getObjectUnderPixel: function(gl, scene, x, y, callback) {

    if(x < 0 || y < 0 || x >= scene.width || y >= scene.height) {
      callback(false);
      return;
    }

    scene.renderForSelect = true;
    scene.renderForSelectColor = true;
    scene.renderForSelectTexture = false;

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.selectionFBO);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.disable(gl.BLEND);

    // NOTE: We draw using the last rendered transforms for all WR objects.

    for(var i = 0; i<scene.wrObjects.length; i++) {
      scene.wrObjects[i].render(gl, this, this);
    }

    this.transformUpdated = false;
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, this.selectionPixel);
    callback(true, x, y);
//      console.log('x,y = '+x+','+y+'   color='+this.selectionPixel[0]+' '+this.selectionPixel[1]+' '+this.selectionPixel[2]);
  },


  validationFunction: function(gl, width, height) {
    var selectionPixel = new Uint8Array(4);
    var i;
    var maxXY = width*height*1.0;


//    var tests = [ [0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1], [0, 128], [0, 256], [0, 384] ];
//    for(i=0; i<tests.length; i++) {
//      var ix = tests[i][0];
//      var iy = tests[i][1];
//      gl.readPixels(ix, iy, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, selectionPixel);
//      console.log('x,y = '+ix+','+iy+'   color='+selectionPixel[0]+' '+selectionPixel[1]+' '+selectionPixel[2]);
//    }

    var x = 0;
    var y = 0;
    var r = 0;
    var g = 0;
    var b = 0;
    for(i=0; i<maxXY; i++) {
      gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, selectionPixel);
      var rP = selectionPixel[0];
      var gP = selectionPixel[1];
      var bP = selectionPixel[2];
      if ( r !== rP || g !== gP || b !== bP ) {
        console.log('x,y = '+x+','+y+'   color='+selectionPixel[0]+' '+selectionPixel[1]+' '+selectionPixel[2]+' Expected color: '+r+','+g+','+b);
      }

      b++;
      if(b > 255) {
        b = 0;
        g++;
        if(g > 255) {
          g = 0;
          r++;
        }
      }

      x++;
      if(x >= width) {
        x = 0;
        y++;
      }
    }

//    var seed = 42;
//    var rand = new Random(seed);
//
//    var count = this.height;
//    for(i=0; i<count; i++) {
//      var x = Math.floor(rand.random()*width);
//      var y = Math.floor(rand.random()*height);
//      if(x*y > maxXY) { continue; }
//
//      x = 0;
//      y = i;
//
//      gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, selectionPixel);
//      var xy = this.getXYFromIntColor(selectionPixel[0], selectionPixel[1], selectionPixel[2]);
//      if(xy.x !== x || xy.y !== y || true) {
//        console.log('x,y = '+x+','+y+'   color='+selectionPixel[0]+' '+selectionPixel[1]+' '+selectionPixel[2]+' XY from Color: '+xy.x+','+xy.y);
//      }
//    }

  },

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
