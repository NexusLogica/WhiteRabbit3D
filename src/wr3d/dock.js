/**********************************************************************

File     : dock.js
Project  : N Simulator Library
Purpose  : Source file for a field viewer settings component.
Revisions: Original definition by Lawrence Gunn.
           2014/09/20

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var Ngl = Ngl || {};

Ngl.Object3D = function(position, size) {
  var _this = this;
  _this.position = position;
  _this.size = size;
  _this.initialized = false;
  _this.children = [];
  _this.transformUpdated = true;
  _this.transform = mat4.create();
  _this.worldTransform = mat4.create();
  _this.projectionModelView = mat4.create();
  _this.selectProjectionModelView = mat4.create();
  _this.color = vec4.fromValues(1, 0, 0, 1);
  _this.selectColor = vec4.fromValues(0, 0, 1, 1);

  var initialize = function(gl, scene, parent) {
    _this.initialized = true;
    var array = new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0]);
    _this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, _this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);

    _this.program = scene.simpleShader.program;
    _this.positionLocation = gl.getAttribLocation(_this.program, 'position');
    _this.sizeLocation = gl.getUniformLocation(_this.program, 'size');
    _this.projectionMatrixLocation = gl.getUniformLocation(_this.program, 'projectionMatrix');
    _this.surfaceColorLocation = gl.getUniformLocation(_this.program, 'surfaceColor');
  };

  var render = function(gl, scene, parent) {
    if(!_this.initialized) {
      initialize(gl, scene, parent);
    }

    if(parent.transformUpdated || _this.transformUpdated) {
      mat4.multiply(_this.worldTransform, parent.worldTransform,  _this.transform);
      mat4.multiply(_this.projectionModelView, scene.projectionMatrix, _this.worldTransform);
    }

    if(scene.renderForSelect) {
      mat4.multiply(_this.worldTransform, parent.worldTransform,  _this.transform);
      mat4.multiply(_this.selectProjectionModelView, scene.selectProjectionMatrix, _this.worldTransform);
    } else {
      mat4.multiply(_this.worldTransform, parent.worldTransform,  _this.transform);
      mat4.multiply(_this.projectionModelView, scene.projectionMatrix, _this.worldTransform);
    }

    gl.useProgram(_this.program);
    gl.uniform1f(_this.sizeLocation, _this.size);
    gl.uniformMatrix4fv(_this.projectionMatrixLocation, gl.FALSE, scene.renderForSelect ? _this.selectProjectionModelView : _this.projectionModelView);
    gl.uniform4fv(_this.surfaceColorLocation, scene.renderForSelect ? _this.selectColor : _this.color);

    gl.bindBuffer(gl.ARRAY_BUFFER, _this.buffer);

    // Where the vertex data needs to go.
    gl.enableVertexAttribArray(_this.positionLocation);
    gl.vertexAttribPointer(_this.positionLocation, 2, gl.FLOAT, gl.FALSE, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };

  return {
    render: render
  }
};
