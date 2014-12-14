/**********************************************************************

File     : html-canvas.js
Project  : N Simulator Library
Purpose  : Source file for an HTML canvas surface.
Revisions: Original definition by Lawrence Gunn.
           2014/10/01

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

Ngl.HtmlCanvas = function(host, config) {
  this.host = $(host);
  this.top = $(this.host.children().get(0));

  this.config = config;

  this.canvasInitialized = false;
  this.updateRequired = false;
  this.mouseOverElements = [];
  this.updateCanvas = undefined;
};

Ngl.HtmlCanvas.nextCanvasElementNum = 0;

Ngl.HtmlCanvas.prototype.setPanel = function(panel) {
  this.panel = panel;
}

Ngl.HtmlCanvas.prototype.load = function(gl) {
  var _this = this;
  var deferred = $.Deferred();

  this.sizeElements(this.host, this.top);
  this.buildLayoutTree();

  var start = new Date();
  html2canvas(this.host.get(0), {
    //background: undefined,
    onrendered: function(canvas) {
      var element = $('.html2canvas-canvas').get(0);
      _this.updateCanvas = canvas;
      //element.appendChild(canvas);
      _this.createTexturemap(gl, canvas);
      var end = new Date();
      Ngl.log("*** Time = "+(end.getTime()-start.getTime()));

      _this.watchDomChanges();
      deferred.resolve();
    },
    onclone: function(element) {
      $(element).find('.wr3d-host').css('visibility', 'visible');
      //$(element).find('.html2canvas-container').css('background-color', 'green').css('top', '0px');
    }
  });

  return deferred;
};

var x = false;
Ngl.HtmlCanvas.prototype.watchDomChanges = function() {

   // select the target node
  var target = this.host.find('button');

  var _this = this;
  // create an observer instance
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if(!x) {
        console.log(mutation.type);
        _this.setUpdateRequired(true);
        x = true;
      }
    });
  });

  // configuration of the observer:
  var config = {attributes: true, childList: true, characterData: true, subtree: true };

  // pass in the target node, as well as the observer options
  observer.observe(target.get(0), config);

  // later, you can stop observing
  //////////observer.disconnect();
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
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.updateCanvas);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, null);
  this.updateCanvas = undefined;
};

Ngl.HtmlCanvas.prototype.bindTexturemap = function(gl) {
  if(this.texture) {
    gl.activeTexture(gl.TEXTURE0+0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    var required = this.getUpdateRequired();
    if(required && this.updateCanvas) {
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.updateCanvas);
      gl.generateMipmap(gl.TEXTURE_2D);
      this.updateCanvas = undefined;
    }
  }
};

Ngl.HtmlCanvas.prototype.getUpdateRequired = function() {
  return this.updateRequired;
};

Ngl.HtmlCanvas.prototype.setUpdateRequired = function(required) {
  this.updateRequired = required;
  this.updateCanvas = undefined;
  var _this = this;

  var start = new Date();

  html2canvas(this.host.get(0), {
    onrendered: function(canvas) {
      var element = $('.html2canvas-canvas').get(0);
      //element.appendChild(canvas);
      _this.updateCanvas = canvas;
      var end = new Date();
      Ngl.log("*** Time = "+(end.getTime()-start.getTime()));
    },
    onclone: function(element) {
      $(element).find('.wr3d-host').css('visibility', 'visible');
    }
  });

};

Ngl.HtmlCanvas.prototype.dispatchMouseEvent = function(scene, targetData, event) {
  Ngl.log('Event: '+event.type);
  if(_.isUndefined(event.offsetX)) {
    event.offsetX  = event.clientX - $(targetData.target).offset().left;
    event.offsetY  = event.clientY - $(targetData.target).offset().top;
  }

/*
  //if(event.type === 'mouseleave' || event.type === 'mousedown') {
  //  return;
  //}
  if(event.type === 'mousedown') {
  //  return;
  }
  if(event.type === 'mouseleave' || event.type === 'mouseenter' || event.type === 'mousedown' || event.type === 'mouseup') {
    var _this = this;
//    setTimeout(function() { _this.setUpdateRequired(true); }, 60);
  }
*/
  targetData.target.dispatchEvent(event);
};

Ngl.HtmlCanvas.prototype.findElementUnderXyPosition = function(scene, x, y) {
  var mouseOvers = [];
  var target = this.layoutTree.findTarget(x, y, mouseOvers);

  var e = {
    target: target,
    screenX: $(target.element).offset().top + window.screenY,
    screenY: $(target.element).offset().left + window.screenX,
    clientX: x-target.x,
    clientY: y-target.y
  };

  var leaving = _.without(this.mouseOverElements, mouseOvers);
  _.forEach(leaving, function(layout) {
    var eLeave = { eventType: 'mouseleave', clientX: e.clientX, clientY: e.clientY, screenX: e.screenX, screenY: e.screenY };
    scene.addMouseEvent(this.panel, { target: layout.element }, eLeave);
  }, this);

  var entering = _.xor(this.mouseOverElements, mouseOvers);
  _.forEach(entering, function(layout) {
    var eEnter = { eventType: 'mouseenter', clientX: e.clientX, clientY: e.clientY, screenX: e.screenX, screenY: e.screenY };
    scene.addMouseEvent(this.panel, { target: layout.element }, eEnter);
  }, this);

  this.mouseOverElements = mouseOvers;
  return { target: target.element, canvasX: x, canvasY: y, targetX: x-target.x, targetY: y-target.y };
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
