/**********************************************************************

File     : wr-panel.js
Project  : N Simulator Library
Purpose  : Source file for a WhiteRabbit panel object.
Revisions: Original definition by Lawrence Gunn.
           2014/10/26

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

Ngl.WrPanel = function(data) {
  Ngl.WrDock.call(this);
  this.configuration = _.cloneDeep(data);
  this.canvasInitialized = false;
};

Ngl.WrPanel.prototype = Object.create(Ngl.WrDock.prototype);

Ngl.WrPanel.prototype = {
  constructor: Ngl.WrPanel,

  initialize: function(gl, scene) {
    Ngl.WrDock.prototype.initialize.call(this, gl, scene);
    scene.addWrObject(this);

    var _this = this;

    if(this.configuration.canvasUrl) {
      this.canvas = new Ngl.Canvas(this.configuration.canvasUrl);
      this.canvas.load(gl, this.configuration.canvasUrl).then(function() {
          _this.finalizeInitialization(gl, scene);
        }, function() {
          Ngl.Log('ERROR: Panel '+_this.configuration.name+' could not load canvas configuration: '+_this.configuration.canvasUrl);
        }
      );
    }
  },

  finalizeInitialization: function(gl, scene) {

    // The 'this.texture.width' is the displayable pixel width, not the texture's full width.
    var width = this.canvas.canvasWidth;
    var height = this.canvas.canvasHeight;

    // Size of the 3D polygons.
    var w2 = width/2.0;
    var h2 = height/2.0;
   // var scale = 0.004;
    var scale = 0.002;
    w2 *= scale;
    h2 *= scale;
    this.size = new Float32Array([w2, h2]);

    // Texture coordinates.
//    var scaleX = scene.selectionRenderer.width/this.canvas.texturemapWidth;
    var scaleX = width/scene.selectionRenderer.width;
    var scaleY = this.canvas.texturemapHeight/scene.selectionRenderer.height;
//    this.textureScale = new Float32Array([1.0, 1.0]);
    this.textureScale = new Float32Array([width/this.canvas.texturemapWidth, 1.0]);
    this.selectionTextureScale = new Float32Array([scaleX, scaleY]);

    var tmw = 1.0;//this.width/this.canvas.texturemapWidth;
    var tmh = 1-height/this.canvas.texturemapHeight;

    var d = 0.1*width;
    var array = new Float32Array([
        -1.0, -1.0, 0.0, tmh,
         1.0, -1.0, tmw, tmh,
        -1.0,  1.0, 0.0, 1.0,
        -1.0,  1.0, 0.0, 1.0,
         1.0, -1.0, tmw, tmh,
         1.0,  1.0, tmw, 1.0]);

    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);

    this.color = vec4.fromValues(1, 0, 0, 1);

    // The main shader and its locations.
    this.program = scene.shaders.texture.program;
    this.positionLocation = gl.getAttribLocation(this.program, 'position');
    this.sizeLocation = gl.getUniformLocation(this.program, 'size');
    this.projectionMatrixLocation = gl.getUniformLocation(this.program, 'projectionViewMatrix');
    this.textureLocation = gl.getAttribLocation(this.program, 'texCoord');
    this.textureScaleLocation = gl.getUniformLocation(this.program, 'textureScale');

    // The color select shader and its locations.
    this.selectColorProgram = scene.shaders['texture-color-select'].program;
    this.positionLocationCs = gl.getAttribLocation(this.selectColorProgram, 'position');
    this.sizeLocationCs = gl.getUniformLocation(this.selectColorProgram, 'size');
    this.projectionMatrixLocationCs = gl.getUniformLocation(this.selectColorProgram, 'projectionViewMatrix');
    this.textureLocationCs = gl.getAttribLocation(this.selectColorProgram, 'texCoord');
    this.surfaceColorLocationCs = gl.getUniformLocation(this.selectColorProgram, 'surfaceColor');
    this.textureScaleLocationCs = gl.getUniformLocation(this.selectColorProgram, 'textureScale');

    // The color select shader and its locations.
    this.selectTextureProgram = scene.shaders['texture-texture-select'].program;
    this.positionLocationTs = gl.getAttribLocation(this.selectTextureProgram, 'position');
    this.sizeLocationTs = gl.getUniformLocation(this.selectTextureProgram, 'size');
    this.projectionMatrixLocationTs = gl.getUniformLocation(this.selectTextureProgram, 'projectionViewMatrix');
    this.textureLocationTs = gl.getAttribLocation(this.selectTextureProgram, 'texCoord');
    this.textureScaleLocationTs = gl.getUniformLocation(this.selectTextureProgram, 'textureScale');

    this.canvasInitialized = true;
  },

  render: function(gl, scene) {
    if(!this.canvasInitialized) {
      if(!this.initialized) {
        this.initialize(gl, scene);
        if(!this.canvasInitialized) { return; }
      } else {
        return;
      }
    }

    Ngl.Dock.prototype.preRender.call(this, gl, scene);

    var renderType = '';
    if(scene.renderForSelectColor) {
      renderType = 'Cs';
      gl.useProgram(this.selectColorProgram);
      gl.uniform4fv(this.surfaceColorLocationCs, this.selectColor);

    } else if(scene.renderForSelectTexture) {
      renderType = 'Ts';

      gl.activeTexture(gl.TEXTURE0+0);
      gl.bindTexture(gl.TEXTURE_2D, scene.selectionRenderer.selectionTexture);

      gl.useProgram(this.selectTextureProgram);

    } else {
      this.canvas.bindTexturemap(gl);
      gl.useProgram(this.program);

      // Only update during regular render cycles.
      if(this.parent.transformUpdated || this.transformUpdated) {
        mat4.multiply(this.worldTransform, this.parent.worldTransform,  this.transform);
        mat4.multiply(this.projectionModelView, scene.projectionMatrix, this.worldTransform);
      }
    }


    gl.uniformMatrix4fv(this['projectionMatrixLocation'+renderType], gl.FALSE, this.projectionModelView);
    gl.uniform2fv(this['sizeLocation'+renderType], this.size);
    gl.uniform2fv(this['textureScaleLocation'+renderType], renderType === 'Ts' ? this.selectionTextureScale : this.textureScale);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

    // Where the vertex data needs to go.
    gl.enableVertexAttribArray(this['positionLocation'+renderType]);
    gl.enableVertexAttribArray(this['textureLocation'+renderType]);

    gl.vertexAttribPointer(this['positionLocation'+renderType], 2, gl.FLOAT, gl.FALSE, 16, 0);
    gl.vertexAttribPointer(this['textureLocation'+renderType],  2, gl.FLOAT, gl.FALSE, 16, 8);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    Ngl.Dock.prototype.postRender.call(this, gl, scene);
  },

  onEvent: function(event) {
    if(this.canvasInitialized) {
      this.canvas.onEvent(event);
    }
  }
};
