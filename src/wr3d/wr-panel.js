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
  this.config = _.cloneDeep(data);
  this.canvasInitialized = false;
};

Ngl.WrPanel.prototype = Object.create(Ngl.WrDock.prototype);

Ngl.WrPanel.prototype.constructor = Ngl.WrPanel;

Ngl.WrPanel.prototype.initialize = function(gl, scene) {
  Ngl.WrDock.prototype.initialize.call(this, gl, scene);
  scene.addWrObject(this);

  var _this = this;

  this.canvas = new Ngl.HtmlCanvas(this.config, this);
  this.canvas.load(gl).then(function() {
      _this.finalizeInitialization(gl, scene);
    }, function() {
      Ngl.log('ERROR: Panel '+_this.config.name+' could not load canvas config: '+_this.config.canvasUrl);
    }
  );
};

Ngl.WrPanel.prototype.finalizeInitialization = function(gl, scene) {

  this.width = this.canvas.canvasWidth;
  this.height = this.canvas.canvasHeight;

  this.recalculatePosition = true;
  this.calculatePositioning(gl, scene);

  // Size of the 3D polygons.
  var w2 = this.width;
  var h2 = this.height;
  w2 *= this.totalScaling;
  h2 *= this.totalScaling;
  this.size = new Float32Array([w2, h2, 0.0]);

  // Texture coordinates.
  var scaleX = this.width/scene.selectionRenderer.width;
  var scaleY = this.canvas.texturemapHeight/scene.selectionRenderer.height;
  this.textureScale = new Float32Array([this.width/this.canvas.texturemapWidth, 1.0]);
  this.selectionTextureScale = new Float32Array([scaleX, scaleY]);

  var meshData = this.createMesh(scene, parseInt(this.width/10), parseInt(this.height/10));
  this.numIndices = meshData.numIndices;

  this.vertexArrayBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexArrayBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, meshData.vertexData, gl.STATIC_DRAW);

  this.indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, meshData.indexData, gl.STATIC_DRAW);

  this.surfaceColor = vec4.fromValues(0.0, 0.0, 0.0, 1.0);

  // Load the shaders and find the locations.
  this.programs = {
      normal:   { progName: 'texture', ext: 'Nrm' },
      colorSel: { progName: 'texture-color-select', ext: 'Cs' },
      texSel:   { progName: 'texture-texture-select', ext: 'Ts' }};

  // As the location information is different for each program, do this in a loop with the programs information.
  _.forEach(this.programs, function(prog) {
    var program = scene.shaders[prog.progName].program;
    this['program'+prog.ext] = program;

    this['positionLocation'+prog.ext] = gl.getAttribLocation(program, 'position');
    this['sizeLocation'+prog.ext] = gl.getUniformLocation(program, 'size');
    this['projectionMatrixLocation'+prog.ext] = gl.getUniformLocation(program, 'projectionViewMatrix');
    this['textureLocation'+prog.ext] = gl.getAttribLocation(program, 'texCoord');
    this['selectionTextureLocation'+prog.ext] = gl.getAttribLocation(program, 'selectionTexCoord');
    this['flagsLocation'+prog.ext] = gl.getUniformLocation(program, 'flags');
    this['instructionLocation'+prog.ext] = gl.getUniformLocation(program, 'instructions');
    this['pixelSizeLocation'+prog.ext] = gl.getUniformLocation(program, 'pixelSize');
    this['surfaceColorLocation'+prog.ext] = gl.getUniformLocation(program, 'surfaceColor');

    this['surfaceLocations'+prog.ext] = [];

    for(var i=0; i<Ngl.MAX_NUM_SURFACES; i++) {
      this['surfaceLocations'+prog.ext].push({
        mat: gl.getUniformLocation(program, 'surfaceDataArray['+i+'].floatData'),
        before: gl.getUniformLocation(program, 'surfaceDataArray['+i+'].transformBefore'),
        after: gl.getUniformLocation(program, 'surfaceDataArray['+i+'].transformAfter'),
        ivec: gl.getUniformLocation(program, 'surfaceDataArray['+i+'].integerData')
      });
    }
  }, this);

  this.canvasInitialized = true;

  this.setupVertexShaderWarping();
};

Ngl.WrPanel.prototype.onPositioningRecalculated = function() {
  var w2 = this.width;
  var h2 = this.height;
  w2 *= this.totalScaling;
  h2 *= this.totalScaling;
  this.size = new Float32Array([w2, h2, 0.0]);
};

Ngl.WrPanel.prototype.render = function(gl, scene) {
  Ngl.WrDock.prototype.preRender.call(this, gl, scene);

  if(!this.canvasInitialized) {
    if(!this.initialized) {
      this.initialize(gl, scene);
      if(!this.canvasInitialized) {
        Ngl.WrDock.prototype.postRender.call(this, gl, scene);
        return;
      }
    } else {
      Ngl.WrDock.prototype.postRender.call(this, gl, scene);
      return;
    }
  }

  var renderType = '';
  if(scene.renderForSelectColor) {
    renderType = 'Cs';
    this.flags[0] = 2;

  } else if(scene.renderForSelectTexture || scene.debugSelect) {
    renderType = 'Ts';

    gl.activeTexture(gl.TEXTURE0+0);
    gl.bindTexture(gl.TEXTURE_2D, scene.selectionRenderer.selectionTexture);
    this.flags[0] = 1;


  } else {
    this.canvas.bindTexturemap(gl);
    renderType = 'Nrm';
    this.flags[0] = 0;

    // Only update during regular render cycles.
    if(this.parent.transformUpdated || this.transformUpdated) {
      mat4.multiply(this.worldTransform, this.parent.worldTransform,  this.transform);
      mat4.multiply(this.projectionModelView, scene.camera.projectionMatrix, this.worldTransform);
    }
  }

  gl.useProgram(this['program'+renderType]);

  gl.uniformMatrix4fv(this['projectionMatrixLocation'+renderType], gl.FALSE, this.projectionModelView);
  gl.uniform3fv(this['sizeLocation'+renderType], this.size);
  gl.uniform2fv(this['textureScaleLocation'+renderType], renderType === 'Ts' ? this.selectionTextureScale : this.textureScale);
  gl.uniform4iv(this['flagsLocation'+renderType], this.flags);
  gl.uniform4iv(this['instructionLocation'+renderType], this.instructions);
  gl.uniform1f(this['pixelSizeLocation'+renderType], this.pixelSize);
  gl.uniform4fv(this['surfaceColorLocation'+renderType], renderType === 'Cs' ? this.selectColor : this.surfaceColor);

  // Attach surface data to the shader.
  var surfaceLocation = this['surfaceLocations'+renderType];
  for(var i=0; i<this.surfaces.length; i++) {
    this.surfaces[i].attachToShader(gl, scene, surfaceLocation[i]);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexArrayBuffer);

  // Where the vertex data needs to go.
  gl.enableVertexAttribArray(this['positionLocation'+renderType]);
  gl.enableVertexAttribArray(this['textureLocation'+renderType]);

  gl.vertexAttribPointer(this['positionLocation'+renderType], 3, gl.FLOAT, gl.FALSE, 40, 0);
//  gl.vertexAttribPointer(this['normalLocation'+renderType],  3, gl.FLOAT, gl.FALSE, 40, 12);
  gl.vertexAttribPointer(this['textureLocation'+renderType],  2, gl.FLOAT, gl.FALSE, 40, 24);
  gl.vertexAttribPointer(this['selectionTextureLocation'+renderType],  2, gl.FLOAT, gl.FALSE, 40, 32);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

  gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);

  Ngl.WrDock.prototype.postRender.call(this, gl, scene);
};

/***
 * Create a rectangular mesh that has horizontally numRows of vertices and vertically numCols of vertices
 * @param numRows {Integer} The number of rows of vertices, so there will be numRows-1 of rectangular polygons.
 * @param numCols {Integer} The number of columns of vertices, so there will be numCols-1 of rectangular polygons.
 * @param horizTexCoord
 * @param vertTexCoord
 * @returns {{vertexData: Float32Array, indexData: Uint16Array, numIndices: number}}
 */
Ngl.WrPanel.prototype.createMesh = function(scene, numCols, numRows) {

  var vertexData = new Float32Array(numRows*numCols*(3+3+2+2));

  var tmStartX = this.canvas.canvasLeft/this.canvas.texturemapWidth;
  var tmEndX = this.canvas.canvasWidth/this.canvas.texturemapWidth+tmStartX;
  var tmStartY = 1.0-this.canvas.canvasTop/this.canvas.texturemapHeight;
  var vertTexCoord = 1.0-this.height/this.canvas.texturemapHeight;
  var tmEndY = vertTexCoord-this.canvas.canvasTop/this.canvas.texturemapHeight;

  var tmIncX = (tmEndX-tmStartX)/(numCols-1);
  var tmIncY = (tmEndY-tmStartY)/(numRows-1);
  var tmY = tmStartY;

  var stmStartX = this.canvas.canvasLeft/scene.selectionRenderer.width;
  var stmEndX = this.canvas.canvasWidth/scene.selectionRenderer.width+stmStartX;
  var stmStartY = 1.0-this.canvas.canvasTop/scene.selectionRenderer.height;
  var sVertTexCoord = 1.0-this.height/scene.selectionRenderer.height;
  var stmEndY = sVertTexCoord-this.canvas.canvasTop/scene.selectionRenderer.height;

  var stmIncX = (stmEndX-stmStartX)/(numCols-1);
  var stmIncY = (stmEndY-stmStartY)/(numRows-1);
  var stmY = stmStartY;

  var y = 0.0;
  var xInc = 1.0/(numCols-1);
  var yInc = -1.0/(numRows-1);
  var i = 0;
  for(var j = 0; j < numRows; j++) {
    var tmX  = tmStartX;
    var stmX = stmStartX;
    var x = 0.0;

    for(var k = 0; k < numCols; k++) {

      // Position
      vertexData[i] = x;     i++;
      vertexData[i] = y;     i++;
      vertexData[i] = 0.0;   i++;

      // Normal
      vertexData[i] = 0.0;   i++;
      vertexData[i] = 0.0;   i++;
      vertexData[i] = 1.0;   i++;

      // Texture coords
      vertexData[i] = tmX;   i++;
      vertexData[i] = tmY;   i++;

      // Texture coords for the selection texture
      vertexData[i] = stmX;   i++;
      vertexData[i] = stmY;   i++;

      tmX += tmIncX;
      stmX += stmIncX;
      x += xInc;
    }
    tmY += tmIncY;
    stmY += stmIncY;
    y += yInc;
  }

  var numIndices = (numRows-1)*(numCols+1)*6;
  var indexData = new Uint16Array(numIndices);

  i = 0;
  for(var iY = 0; iY < numRows-1; iY++) {
    var iTop = iY*numCols;
    var iBottom = (iY+1)*numCols;
    for(var iX = 0; iX < numCols-1; iX++) {
      indexData[i] = iTop;      i++;
      indexData[i] = iBottom;   i++;
      indexData[i] = iBottom+1; i++;

      indexData[i] = iBottom+1; i++;
      indexData[i] = iTop+1;    i++;
      indexData[i] = iTop;      i++;

      iTop++;
      iBottom++;
    }
  }
  return { vertexData: vertexData, indexData: indexData, numIndices: numIndices };
};

Ngl.WrPanel.prototype.setupVertexShaderWarping = function() {
  if(!this.config.hasOwnProperty('surfaceProperties3d')) { return; }
  this.surfaceProperties = JSON.parse(this.config.surfaceProperties3d);

  // We are using indexes 0 to 3 for surfaces.
  for(var i=0; i<this.surfaceProperties.length; i++) {
    var props = this.surfaceProperties[i];
    switch(props.type) {
      case 'rectangular': {
        this.instructions[i] = 1;
      }
      case 'circular': {
        this.instructions[i] = 2;
      }
    }
  }

};

Ngl.WrPanel.prototype.onEvent = function(scene, event) {
  if(this.canvasInitialized) {
    this.canvas.onEvent(scene, event);
  }
};

Ngl.WrPanel.prototype.onMouseLeave = function(scene) {
  if(this.canvasInitialized) {
    this.canvas.onMouseLeave(scene);
  }
};
