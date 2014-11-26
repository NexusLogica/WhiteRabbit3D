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
  this.selectionPixel = new Uint8Array(4);
  this.width  = 1024;
  this.height = 1024;

  this.c0 = 256;
  this.c1 = 256*this.c0;
};

Ngl.SelectionRenderer.prototype = {

  createSelectionTexture: function(gl, scene, width, height, testFunction) {
    this.width  = !_.isUndefined(width)  ? Ngl.powerOfTwo(width)  : Ngl.powerOfTwo(this.width);
    this.height = !_.isUndefined(height) ? Ngl.powerOfTwo(height) : Ngl.powerOfTwo(this.height);

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
      1.0,  1.0, 1.0, 0.0,
     -1.0,  1.0, 0.0, 0.0,
     -1.0, -1.0, 0.0, 1.0,
      1.0,  1.0, 1.0, 0.0,
     -1.0, -1.0, 0.0, 1.0,
      1.0, -1.0, 1.0, 1.0
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

  getObjectUnderPixel: function(gl, scene, x, y) {

    if(x < 0 || y < 0 || x >= scene.width || y >= scene.height) {
      return { x: x, y: y, obj: null };
    }

    var wrObj = this.findObject(gl, scene, x, y);

    if(wrObj) {
      var pixel = this.findPixelOnObject(gl, scene, x, y, wrObj);
      return { canvasX: x, canvasY: y, target: wrObj, targetX: pixel.x, targetY: pixel.y };
    }

    return { canvasX: x, canvasY: y, target: null };
  },

  findObject: function(gl, scene, x, y) {

    scene.renderForSelect = true;
    scene.renderForSelectColor = true;
    scene.renderForSelectTexture = false;

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.selectionFBO);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    /* jshint -W016 */
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    /* jshint +W016 */
    gl.disable(gl.BLEND);

    // NOTE: We draw using the last rendered transforms for all WR objects.
    for(var i = 0; i<scene.wrObjects.length; i++) {
      scene.wrObjects[i].render(gl, scene);
    }

    gl.readPixels(x, scene.height-y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, this.selectionPixel);
    var color = new Ngl.IntegerColor(this.selectionPixel[0], this.selectionPixel[1], this.selectionPixel[2]);
    var obj = scene.wrObjectsByColorHash[color.toString()];
    return obj;
  },

  findPixelOnObject: function(gl, scene, x, y, wrObj) {
    scene.renderForSelect = true;
    scene.renderForSelectColor = false;
    scene.renderForSelectTexture = true;

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.selectionFBO);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    /* jshint -W016 */
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    /* jshint +W016 */
    gl.disable(gl.BLEND);

    wrObj.render(gl, scene);

    gl.readPixels(x, scene.height-y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, this.selectionPixel);
    var color = new Ngl.IntegerColor(this.selectionPixel[0], this.selectionPixel[1], this.selectionPixel[2]);
    var pixel = this.getXYFromIntColor(color.r, color.g, color.b);
    pixel.x -= Ngl.CANVAS_MARGIN;
    pixel.y -= Ngl.CANVAS_MARGIN;
    return pixel;
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
//      Ngl.log('x,y = '+ix+','+iy+'   color='+selectionPixel[0]+' '+selectionPixel[1]+' '+selectionPixel[2]);
//    }

    var x = 0;
    var y = 0;
    var color = new Ngl.IntegerColor();
    var maxLogEntries = 100;
    var logEntries = 0;
    for(i=0; i<maxXY; i++) {
      gl.readPixels(x, height-y-1, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, selectionPixel);
      var readColor = new Ngl.IntegerColor(selectionPixel[0], selectionPixel[1], selectionPixel[2]);
      if(!color.isEqual(readColor)) {
        Ngl.log('x,y = '+x+','+y+'   color='+readColor.toString()+' Expected color: '+color.toString());
        logEntries++;
        if(logEntries > maxLogEntries) { break; }
      }

      color.increment();

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
//        Ngl.log('x,y = '+x+','+y+'   color='+selectionPixel[0]+' '+selectionPixel[1]+' '+selectionPixel[2]+' XY from Color: '+xy.x+','+xy.y);
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
