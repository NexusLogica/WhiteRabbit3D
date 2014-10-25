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

            _this.canvas = new zebra.ui.zCanvas(_this.canvasElement.get(0), _this.texturemapWidth, _this.texturemapHeight);
            _this.canvasElement.width(_this.texturemapWidth).height(_this.texturemapHeight);

            var bag = new zebra.util.Bag(_this.canvas.root);
            bag.load(JSON.stringify(data));

            setTimeout(function() {
              _this.canvas.root.setSize(_this.canvasWidth, _this.canvasHeight);
              setTimeout(function() {
                var button = _this.canvas.root.find('zebra.ui.Button');
                button.bind(function() {
                  Ngl.Log("MOUSE");
                });
                _this.canvasInitialized = true;
              }, 100);
            }, 100);
          },
          function(jqXHR, textStatus, httpStatusCodeDescription) {
            Ngl.Log('LOAD ERROR: Unable to load '+_this.layoutJsonUrl+' : '+textStatus+' : '+jqXHR.status+':'+httpStatusCodeDescription);
          }
        );
      }
    });
  },

  setTexturemapObject: function(textmap) {
    this.texturemapObject = textmap;
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

function dispatchMouseDown(x, y) {
  var edown = jQuery.Event( "mousedown", { pageX: x, pageY: y, button: 0 } );
  $('.canvas-2d').trigger(edown);


  setTimeout(function() {
    var e = jQuery.Event( "mouseup", { pageX: x, pageY: y, button: 0 } );
    $('.canvas-2d').trigger(e);

    setTimeout(function() {
      var ec = jQuery.Event( "click", { pageX: x, pageY: y, button: 0 } );
      $('.canvas-2d').trigger(ec);
    }, 5);
  }, 5);
}
/*
$('.simulate').click(function() {
  dispatchMouseDown(145+window.pageXOffset, 230+window.pageYOffset);
});

$('.canvas-2d').on('click', function() {
  Ngl.Log('CANVAS CLICKED');
});

$('.canvas-2d').on('mousedown', function() {
  Ngl.Log('CANVAS MOUSEDOWN');
});


$('.canvas-2d').on('mouseup', function() {
  Ngl.Log('CANVAS MOUSEUP');
});
*/