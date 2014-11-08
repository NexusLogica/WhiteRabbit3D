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

Ngl.Canvas = function(layoutJsonUrl, panel) {
  this.canvasInitialized = false;
  this.panel = panel;
};

Ngl.Canvas.nextCanvasElementNum = 0;

Ngl.Canvas.prototype = {

  load: function(gl, layoutJsonUrl) {
    var _this = this;
    html2canvas(document.getElementById('html2canvas-test'), {
      background: undefined,
      onrendered: function(canvas) {
        var element = document.getElementById('html2canvas-canvas');
        element.appendChild(canvas);
        _this.createTexturemap(gl, canvas);
      }
    });

    //this.createHtmlCanvas(gl);
    this.layoutJsonUrl = layoutJsonUrl;
    var deferred = $.Deferred();

    zebra()["zebra.json"] = "../src/lib/zebra/zebra.json";
    zebra.ready(function() {
      if(_this.layoutJsonUrl) {
        var ajaxData = { type: 'GET', url: _this.layoutJsonUrl, dataType: 'json' };
        $.ajax(ajaxData).then(
          function(data, textStatus, jqXHR) {

            _this.canvasWidth = data['ngl.width'];
            _this.canvasHeight = data['ngl.height'];
//            _this.canvasTop = data.hasOwnProperty('ngl.canvasTop') ? data['ngl.canvasTop'] : _this.texturemapHeight+2;

            _this.texturemapWidth = _this.powerOfTwo(_this.canvasWidth);
            _this.texturemapHeight = _this.powerOfTwo(_this.canvasHeight);

            _this.canvasTop = _this.texturemapHeight+2;

            _this.canvasElement = $('<canvas/>', {
              class: 'white-rabbit-internal-canvas-'+Ngl.Canvas.nextCanvasElementNum,
              style: 'position:fixed; top:-'+_this.canvasTop+'px; left:0px;'}).appendTo('body');
            Ngl.Canvas.nextCanvasElementNum++;

            _this.canvas = new zebra.ui.zCanvas(_this.canvasElement.get(0), _this.texturemapWidth, _this.texturemapHeight);
            _this.canvasElement.width(_this.texturemapWidth).height(_this.texturemapHeight);

            var bag = new zebra.util.Bag(_this.canvas.root);
            bag.load(JSON.stringify(data));

            setTimeout(function() {

              // Kind of ugly, but Zebkit has troubles clearing the background. So clear it totally prior to the resize.
              var ctx = _this.canvasElement.get(0).getContext("2d");
              var op = ctx.globalCompositeOperation;
              ctx.globalCompositeOperation = 'copy';
              ctx.fillStyle = 'rgba(0, 0, 0, 0.0)';
              ctx.fillRect(0, 0, _this.texturemapWidth, _this.texturemapHeight);
              ctx.globalCompositeOperation = op;

              // Nice if this could be done in the JSON.
              _this.canvas.root.setSize(_this.canvasWidth, _this.canvasHeight);

              setTimeout(function() {
//                _this.createTexturemap(gl);
                deferred.resolve();
              }, 100);
            }, 100);
          },
          function(jqXHR, textStatus, httpStatusCodeDescription) {
            Ngl.log('LOAD ERROR: Unable to load '+_this.layoutJsonUrl+' : '+textStatus+' : '+jqXHR.status+':'+httpStatusCodeDescription);
            deferred.reject();
          }
        );
      }
    });
    return deferred;
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

      var region = this.getUpdateRegion();
      if(region && false) {
        var canvasX = $("svg").get(0);
//        var canvasX = $(".canvas-raster").get(0);

        gl.texSubImage2D(gl.TEXTURE_2D, 0, region.x, region.y, gl.RGBA, gl.UNSIGNED_BYTE, canvasX);
//        gl.texSubImage2D(gl.TEXTURE_2D, 0, region.x, region.y, gl.RGBA, gl.UNSIGNED_BYTE, this.canvasElement.get(0));
        gl.generateMipmap(gl.TEXTURE_2D);
      }
    }
  },

  getUpdateRegion: function() {
    if(this.canvas.canvasNeedsCopy) {
      this.canvas.canvasNeedsCopy = false;
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
