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

Ngl.Canvas = function(layoutJsonUrl) {
  this.canvasInitialized = false;
};

Ngl.Canvas.nextCanvasElementNum = 0;

Ngl.Canvas.prototype = {

  load: function(gl, layoutJsonUrl) {
    this.layoutJsonUrl = layoutJsonUrl;
    var deferred = $.Deferred();

    var _this = this;
    zebra()["zebra.json"] = "../src/lib/zebra/zebra.json";
    zebra.ready(function() {
      if(_this.layoutJsonUrl) {
        var ajaxData = { type: 'GET', url: _this.layoutJsonUrl, dataType: 'json' };
        $.ajax(ajaxData).then(
          function(data, textStatus, jqXHR) {

            _this.canvasWidth = data['ngl.width'];
            _this.canvasHeight = data['ngl.height'];

            _this.texturemapWidth = _this.powerOfTwo(_this.canvasWidth);
            _this.texturemapHeight = _this.powerOfTwo(_this.canvasHeight);

            _this.canvasElement = $('<canvas/>', {
              class: 'white-rabbit-internal-canvas-'+Ngl.Canvas.nextCanvasElementNum,
              style: 'position:fixed; top:-'+(_this.texturemapHeight+2)+'px; left:0px;'}).appendTo('body');
            Ngl.Canvas.nextCanvasElementNum++;

            _this.canvas = new zebra.ui.zCanvas(_this.canvasElement.get(0), _this.texturemapWidth, _this.texturemapHeight);
            _this.canvasElement.width(_this.texturemapWidth).height(_this.texturemapHeight);

            var bag = new zebra.util.Bag(_this.canvas.root);
            bag.load(JSON.stringify(data));

            setTimeout(function() {
              _this.canvas.root.setSize(_this.canvasWidth, _this.canvasHeight);
              setTimeout(function() {
                _this.createTexturemap(gl);
                deferred.resolve();
              }, 100);
            }, 100);
          },
          function(jqXHR, textStatus, httpStatusCodeDescription) {
            Ngl.Log('LOAD ERROR: Unable to load '+_this.layoutJsonUrl+' : '+textStatus+' : '+jqXHR.status+':'+httpStatusCodeDescription);
            deferred.reject();
          }
        );
      }
    });
    return deferred;
  },

  createTexturemap: function(gl) {
    this.texture = gl.createTexture();
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.canvasElement.get(0));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
  },

  bindTexturemap: function(gl) {
    if(this.texture) {
      gl.activeTexture(gl.TEXTURE0+0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);

      var region = this.getUpdateRegion();
      if(region) {
        gl.texSubImage2D(gl.TEXTURE_2D, 0, region.x, region.y, gl.RGBA, gl.UNSIGNED_BYTE, this.canvasElement.get(0));
        gl.generateMipmap(gl.TEXTURE_2D);
      }
    }
  },

  getUpdateRegion: function() {
    if(zebra.ui.paintManager.canvasNeedsCopy) {
      zebra.ui.paintManager.canvasNeedsCopy = false;

      return { x: 0, y: 0, width: this.canvasWidth, height: this.canvasHeight };
    }
    return null;
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

  hasCanvas : function() {
//    return !_.isUndefined(this.canvas);
    return this.canvasInitialized;
  },

  getCanvasElement: function() {
    return this.canvasElement;
  }
};
