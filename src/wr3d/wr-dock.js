/**********************************************************************

File     : wr-dock.js
Project  : N Simulator Library
Purpose  : Source file for a base WhiteRabbit dock object.
Revisions: Original definition by Lawrence Gunn.
           2014/10/26

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

Ngl.WrDock = function(config) {
  this.config = _.cloneDeep(config);

  Ngl.Dock.call(this);

  this.pixelSize = 1.0;
  this.wrTransform = mat4.create();
  this.wrTransformScaled = mat4.create();
  this.wrTransformAndTranform = mat4.create();
  this.surfaces = [];
};

Ngl.WrDock.prototype = Object.create(Ngl.Dock.prototype);

Ngl.WrDock.prototype.initialize = function(gl, scene) {
  Ngl.Dock.prototype.initialize.call(this, gl, scene);
  this.initialized = true;

  this.configureFromStyles(gl, scene);
  this.parseSurfaces();
};

Ngl.WrDock.prototype.configureFromStyles = function(gl, scene) {
  // Scaling
  this.scaling3d = _.isUndefined(this.config['-wr3d-scaling3d']) ? Ngl.Scaling.parent : Ngl.Scaling[this.config['-wr3d-scaling3d'].toLowerCase()];
  this.recalculatePosition = true;
  this.wrScaleFactor = 1.0;
  this.magnification = _.isUndefined(this.config['-wr3d-magnification3d']) ? 1.0 : this.config['-wr3d-magnification3d'];
  this.totalScaling = 1.0;

  // Position from an anchor position.
  this.screenAnchor = this.parseAnchor();
  if(this.screenAnchor) {
    this.anchorToScreen(scene);
  }

  // Parse position3d.
  var _this = this;
  var rotDeg;
  var position3d = this.config['-wr3d-position3d'];
  if(!_.isEmpty(position3d)) {
    var posGroups = (position3d+' ').split(/\)\s+/g);
    _.forEach(posGroups, function(pg) {
      pg = $.trim(pg);
      var posType = pg.substr(0, pg.indexOf('('));
      var posValue = pg.substr(pg.indexOf('(')+1);
      if(!_.isEmpty(posType)) {
        switch (posType) {
          case 'translate': {
            var posVec = Ngl.vecFromString(posValue);
            mat4.translate(_this.wrTransform, _this.wrTransform, posVec);
            break;
          }
          case 'rotateX': {
            rotDeg = Ngl.floatAndUnitFromString(posValue);
            mat4.rotateX(_this.wrTransform, _this.wrTransform, Ngl.radians(rotDeg.value));
            break;
          }
          case 'rotateY': {
            rotDeg = Ngl.floatAndUnitFromString(posValue);
            mat4.rotateY(_this.wrTransform, _this.wrTransform, Ngl.radians(rotDeg.value));
            break;
          }
          case 'rotateZ': {
            rotDeg = Ngl.floatAndUnitFromString(posValue);
            mat4.rotateZ(_this.wrTransform, _this.wrTransform, Ngl.radians(rotDeg.value));
            break;
          }
          default: {
            Ngl.log('ERROR: Invalid wr3d CSS type ' + posType);
          }
        }
      }
    });
  }
};

Ngl.WrDock.prototype.parseAnchor = function() {
  var screenAnchor = this.config['-wr3d-screen-anchor'];
  if (!_.isEmpty(screenAnchor)) {
    var anp = screenAnchor.split(/\s+/g);
    if (anp.length === 2) {
      var zIndex = ($.isNumeric(anp[0]) ? 0 : 1);
      var z = parseFloat(anp[zIndex]);
      var anchor = Ngl.Placement.map[anp[zIndex === 0 ? 1 : 0]];
      if (!_.isUndefined(anchor)) {
        return {z: z, anchor: anchor};
      }
    }
    return undefined;
  }
};

Ngl.WrDock.prototype.parseSurfaces = function() {

  this.config.surface3d = Ngl.parseBracketedStyleList(this.config['-wr3d-surface3d']);

  this.instructionLength = 4;
  this.instructions = new Int32Array(this.instructionLength);
  var i;
  for(i=0; i<this.instructionLength; i++) { this.instructions[i] = 0; }

  this.flagsLength = 4;
  this.flags = new Int32Array(this.flagsLength);
  for(var j=0; i<this.flagsLength; i++) { this.instructions[i] = 0; }

  if(!this.config.surface3d || this.config.surface3d.length === 0) {
    this.config.surface3d = [];
    this.config.surface3d.push(new Ngl.Surface.Rectangular());
  } else {
    for(i=0; i<this.config.surface3d.length; i++) {
      var conf = this.config.surface3d[i];
      var surface = null;
      switch(conf.type.toLowerCase()) {
        case 'rectangular': {
          surface = new Ngl.Surface.Rectangular();
          this.instructions[i] = 1;
          break;
        }
        case 'circular': {
          surface = new Ngl.Surface.Circular();
          this.instructions[i] = 2;
          break;
        }
      }
      if(surface) {
        this.surfaces.push(surface);
        surface.configure(this, conf);
      }
    }
  }
};

Ngl.WrDock.prototype.render = function(gl, scene) {
  this.preRender(gl, scene);
  this.postRender(gl, scene);
};

Ngl.WrDock.prototype.preRender = function(gl, scene) {
  if(!this.initialized) {
    this.initialize(gl, scene);
  }

  this.calculatePositioning(gl, scene);

  this.updateTransform(scene);
};

Ngl.WrDock.prototype.calculatePositioning = function(gl, scene) {
  if(this.recalculatePosition) {
    this.updateTransformWithoutWrTransform(scene);
    this.transformUpdated = true;

    var cameraZ = Math.abs(this.worldTransform[14]);
    this.pixelSize = scene.camera.getPixelSizeAtCameraZ(cameraZ);

    if(this.scaling3d === Ngl.Scaling.screen) {
      this.wrScaleFactor = this.pixelSize;
      this.totalScaling = this.wrScaleFactor*this.magnification;
    }

    this.onPositioningRecalculated();
    this.recalculatePosition = false;
  }
};

Ngl.WrDock.prototype.updateTransform = function(scene) {
  if(this.parent.transformUpdated || this.transformUpdated) {
    mat4.copy(this.wrTransformScaled, this.wrTransform);
    this.wrTransformScaled[12] *= this.totalScaling;
    this.wrTransformScaled[13] *= this.totalScaling;
    this.wrTransformScaled[14] *= this.totalScaling;

    mat4.multiply(this.wrTransformAndTranform, this.wrTransformScaled,  this.transform);
    mat4.multiply(this.worldTransform, this.parent.worldTransform,  this.wrTransformAndTranform);
    mat4.multiply(this.projectionModelView, scene.camera.projectionMatrix, this.worldTransform);
  }
};


Ngl.WrDock.prototype.updateTransformWithoutWrTransform = function(scene) {
  mat4.multiply(this.worldTransform, this.parent.worldTransform,  this.transform);
};

Ngl.WrDock.prototype.onPositioningRecalculated = function() {

};

//*****************
//* Fun WR3D Stuff
//*****************

Ngl.WrDock.prototype.anchorToScreen = function(scene) {
  var z = this.screenAnchor.z;
  if(z === 0.0) {
    Ngl.log('ERROR: Ngl.WrDock.anchorToScreen: Z is zero');
    return;
  }

  var pixelSize = scene.camera.getPixelSizeAtCameraZ(z);
  var w2 = 0.5*scene.gl.drawingBufferWidth;
  var h2 = 0.5*scene.gl.drawingBufferHeight;

  var x, y;
  switch(this.screenAnchor.anchor) {
    case Ngl.Placement.UPPER_LEFT: {
      x = -w2;
      y =  h2;
      break;
    }
    case Ngl.Placement.UPPER_RIGHT: {
      x =  w2;
      y =  h2;
     break;
    }
    case Ngl.Placement.BOTTOM_RIGHT: {
      x =  w2;
      y = -h2;
      break;
    }
    case Ngl.Placement.BOTTOM_LEFT: {
      x = -w2;
      y = -h2;
      break;
    }
    case Ngl.Placement.CENTER: {
      x = 0.0;
      y = 0.0;
      break;
    }
    default: {
      Ngl.log('ERROR: Ngl.WrDock.anchorToScreen: Invalid option '+placement);
      return;
    }
  }

  mat4.identity(this.transform);
////////////////  mat4.rotateX(this.transform, this.transform, Math.PI);
  mat4.translate(this.transform, this.transform, vec3.fromValues(x/pixelSize, y/pixelSize, z));
  this.transformUpdated = true;
};

/***
 * For a given point in the pixel metric space this function returns the position, up and normal vectors, and pixel sizes.
 * Returned is:
 *     transform: The transform of the point in pixel metric coordinates.
 *     pixelMetric: The base pixel metric for the dock. Note that this may be inherited from a parent dock.
 *     pixSizes: The pixel space unit pixel sizes in the x, y (up), and z (norm) directions.
 *
 * @method getMetricsFromPoint
 * @param p { vec4 } The position in pixel coordinates.
 * @returns {{pos: *, up: *, norm: *, pixSizes: *}}
 */
Ngl.WrDock.prototype.getMetricsFromPoint = function(p) {

  var trans = mat4.create();
  mat4.translate(trans, p);

  var pixSizes = vec4.create();

  for(var i=0; i<this.surfaces.length; i++) {
    var surface = this.surfaces[i];
    surface.translate(trans, pixSizes);
  }

  return { transform: trans, pixSizes: pixSizes, pixelMetric: this.pixelSize };
};

/*************************************************************************

[propget]
HRESULT   PixelSize(
  [out,retval] double*          retval);

[propget]
HRESULT   Scale(
  [out,retval] double*          retval);

[propput]
HRESULT   Scale(
  [in] double                   ScalingFactor);

[propget]
HRESULT   SurfaceRescaleType(
  [out,retval] nxsrtSurfaceRescaleType* retval);

[propput]
HRESULT   SurfaceRescaleType(
  [in] nxsrtSurfaceRescaleType  TheType);

[propget]
HRESULT   CanvasSize(
  [out,retval] INxGrPoint**     retval);

HRESULT   GetCanvasSize(
  [in] INxGrPoint*              PointToFill);

HRESULT   SetCanvasSize(
  [in] INxGrPoint*              TheDockCanvasSize);

HRESULT   GetSurfaceGeometry(
  [out] INxGrSurfaceGeometry**  ppiSurfaceGeometry);

[propget]
HRESULT   PixelSizeReferencePosition(
  [out,retval] INxGrPoint**     retval);

HRESULT   GetPixelSizeReferencePosition(
  [in] INxGrPoint*              PointToFill);

HRESULT   SetPixelSizeReferencePosition(
  [in] INxGrPoint*              TheRefPosition);






HRESULT   SurfaceRescaleType(
  [out,retval] nxsrtSurfaceRescaleType* retval);

[propget]
HRESULT   PixelSizeReferencePosition(
  [out,retval] INxGrPoint**     retval);

HRESULT   GetPixelSizeReferencePosition(
  [in] INxGrPoint*              PointToFill);

HRESULT   SetPixelSizeReferencePosition(
  [in] INxGrPoint*              TheRefPosition);


HRESULT   GetTransformAndPixelSizeFromPixel(
  [in] INxGrPoint*              Pixel,
[in] INxGrTransform*          TransformToFill,
  [out,retval] double*          PixelSize);

HRESULT   GetPixelSize(
  [in] INxGrPoint*              Pixel,
  [out,retval] double*          retval);

HRESULT   GetPosition3DFromPixel(
  [in] INxGrPoint*              Pixel,
[in] INxGrPoint*              Position3D);

HRESULT   GetNormalVector(
  [in] INxGrPoint*              Pixel,
[in] INxGrVector*             NormalVector);

HRESULT   GetUpVector(
  [in] INxGrPoint*              Pixel,
[in] INxGrVector*             UpVector);

[propget]
HRESULT   PixelWidth(
  [in] INxGrPoint*              Pixel,
  [out,retval] double*          retval);

[propget]
HRESULT   PixelHeight(
  [in] INxGrPoint*              Pixel,
  [out,retval] double*          retval);

[propget]
HRESULT   PixelZ(
  [in] INxGrPoint*              Pixel,
  [out,retval] double*          retval);

[propget]
HRESULT   DockScale(
  [out,retval] double*          retval);

[propget]
HRESULT   CurvatureX(
  [in] INxGrPoint*              Pixel,
  [out,retval] double*          retval);

[propget]
HRESULT   CurvatureY(
  [in] INxGrPoint*              Pixel,
  [out,retval] double*          retval);

[propget]
HRESULT   SurfaceSizeXPixels(
  [out,retval] double*          retval);

[propget]
HRESULT   SurfaceSizeYPixels(
  [out,retval] double*          retval);

[propget]
HRESULT   ZDistanceFromCamera(
  [out,retval] double*          retval);
}

***************************************************************************/
