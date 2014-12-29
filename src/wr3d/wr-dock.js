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

Ngl.nextDockId = 1;

Ngl.WrDock = function(config) {
  this.config = { '-wr3d-surface3d': '( type: rectangular )' };
  this.config = _.merge(this.config, config);

  Ngl.Dock.call(this);
  this.id = "Wr3d-Anonymous-" + Ngl.nextDockId;
  Ngl.nextDockId++;

  this.pixelSize = 1.0;
  this.pixelSizeReference = Ngl.MetricReference.PARENT;
  this.wrTransform = mat4.create();
  this.wrTransformScaled = mat4.create();
  this.wrTransformAndTranform = mat4.create();
  this.surfaces = [];

  this.wrScaleFactor = 1.0;
  this.totalScaling = 1.0;
  this.magnification = 1.0;
  this.screenAnchor = {};
};

Ngl.WrDock.prototype = Object.create(Ngl.Dock.prototype);

Ngl.WrDock.prototype.initialize = function(gl, scene) {
  this.scene = scene;
  Ngl.Dock.prototype.initialize.call(this, gl, scene);

  scene.addWrObject(this);

  this.configureFromStyles();
};

Ngl.WrDock.prototype.configureFromStyles = function() {
  _.forIn(this.config, function(value, key) {
    this.processStyle(key);
  }, this);
};

Ngl.WrDock.prototype.style = function(styleName) {
  if(arguments.length === 1) {
    return this.config[styleName];
  } else {
    this.config[styleName] = arguments[1];
    this.processStyle(styleName);
  }
};

/***
 * This is an internal method. Use the style() function.
 * @param styleName
 */
Ngl.WrDock.prototype.processStyle = function(styleName) {
  switch(styleName) {
    case '-wr3d-position3d':      this.processPosition3d(); break;
    case '-wr3d-scaling3d':       this.processScaling3d(); break;
    case '-wr3d-magnification3d': this.processMagnification3d(); break;
    case '-wr3d-parent3d':        this.processParent3d(); break;
    case '-wr3d-surface3d':       this.processSurface3d(); break;
  }
  this.recalculatePosition = true;
  this.transformUpdated = true;
};

Ngl.WrDock.prototype.processParent3d = function() {
  var parent3d = this.config['-wr3d-parent3d'];
  var regex = /\W*screen\W*/i;
  if(regex.test(parent3d)) {
    var words = parent3d.split(/\s+/g);
    this.screenAnchor.z = 1.0;
    this.screenAnchor.anchor = 'upper-left';

    for(var i=0; i<words.length; i++) {
      var word = words[i].toLowerCase();
      if(word !== 'screen') {
        if($.isNumeric(word)) {
          this.screenAnchor.z = parseFloat(word);
        } else {
          this.screenAnchor.anchor = Ngl.Placement.map[word];
        }
      }
    }
    this.anchorToScreen(this.scene);
  } else {
    var parent = this.scene.getWrObjectById(this.config['-wr3d-parent3d']);
    if(parent) {
      parent.add(this);
    } else {
      Ngl.log('ERROR: Unable to find parent object with id: '+this.config['-wr3d-parent3d']);
    }
  }
};

Ngl.WrDock.prototype.processScaling3d = function() {
  this.scaling3d = Ngl.Scaling.parent;
  if(!_.isUndefined(this.config['-wr3d-scaling3d'])) {
    this.scaling3d = Ngl.Scaling[this.config['-wr3d-scaling3d'].toLowerCase()];
  }
};
Ngl.WrDock.prototype.processMagnification3d = function() {
  this.magnification = _.isUndefined(this.config['-wr3d-magnification3d']) ? 1.0 : this.config['-wr3d-magnification3d'];
};

Ngl.WrDock.prototype.processPosition3d = function() {
  mat4.identity(this.wrTransform);

  var rotDeg;
  var position3d = this.config['-wr3d-position3d'];
  if (!_.isEmpty(position3d)) {
    var posGroups = (position3d + ' ').split(/\)\s+/g);
    for(var i = 0; i<posGroups.length; i++) {
      var pg = $.trim(posGroups[i]);
      var posType = pg.substr(0, pg.indexOf('('));
      var posValue = pg.substr(pg.indexOf('(') + 1);
      if (!_.isEmpty(posType)) {
        switch (posType) {
          case 'translate':
          {
            var posVec = Ngl.vecFromString(posValue);
            mat4.translate(this.wrTransform, this.wrTransform, posVec);
            break;
          }
          case 'rotateX':
          {
            rotDeg = Ngl.floatAndUnitFromString(posValue);
            mat4.rotateX(this.wrTransform, this.wrTransform, Ngl.radians(rotDeg.value));
            break;
          }
          case 'rotateY':
          {
            rotDeg = Ngl.floatAndUnitFromString(posValue);
            mat4.rotateY(this.wrTransform, this.wrTransform, Ngl.radians(rotDeg.value));
            break;
          }
          case 'rotateZ':
          {
            rotDeg = Ngl.floatAndUnitFromString(posValue);
            mat4.rotateZ(this.wrTransform, this.wrTransform, Ngl.radians(rotDeg.value));
            break;
          }
          default:
          {
            Ngl.log('ERROR: Invalid wr3d CSS type ' + posType);
          }
        }
      }
    }
  }
};

Ngl.WrDock.prototype.processSurface3d = function() {

  var surface3d = Ngl.parseBracketedStyleList(this.config['-wr3d-surface3d']);

  this.instructionLength = 4;
  this.instructions = new Int32Array(this.instructionLength);
  var i;
  for(i=0; i<this.instructionLength; i++) { this.instructions[i] = 0; }

  this.flagsLength = 4;
  this.flags = new Int32Array(this.flagsLength);
  for(var j=0; i<this.flagsLength; i++) { this.instructions[i] = 0; }

  var surface = null;
  if(!surface3d || surface3d.length === 0) {
    surface = new Ngl.Surface.Rectangular();
    this.surfaces.push(surface);
    surface.configure(this, '( type: rectangular )');
    this.instructions[0] = 1;
  } else {
    for(i=0; i<surface3d.length; i++) {
      var conf = surface3d[i];
      surface = null;
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
        surface.style(conf);
      }
    }
  }
};

Ngl.WrDock.prototype.preRender = function(gl, scene) {
  if(!this.initialized) {
    this.initialize(gl, scene);
  }

  this.calculatePositioning(gl, scene);

  this.updateTransform(scene);
};

Ngl.WrDock.prototype.postRender = function(gl, scene) {
  for(var i = 0; i<this.children.length; i++) {
    this.children[i].render(gl, scene);
  }
  this.transformUpdated = false;
  this.recalculatePosition = false;
};

Ngl.WrDock.prototype.calculatePositioning = function(gl, scene) {

  if(this.parent.recalculatePosition) {
    this.recalculatePosition = true;
  }

  if(this.recalculatePosition) {
    if(this.pixelSizeReference === Ngl.MetricReference.PARENT && this.parent.pixelSize !== undefined) {
      this.pixelSize = this.parent.pixelSize;
    } else {
      this.updateTransformWithoutWrTransform(scene);
      this.transformUpdated = true;

      this.pixelSize = scene.camera.getPixelSizeAtPosition(this.viewTransform);
    }

    this.wrScaleFactor = this.pixelSize;
    this.totalScaling = this.wrScaleFactor*this.magnification;

    this.onPositioningRecalculated();
  }
};

Ngl.WrDock.prototype.updateTransform = function(scene) {
  if(this.parent.transformUpdated || this.transformUpdated) {
    mat4.copy(this.wrTransformScaled, this.wrTransform);
    this.wrTransformScaled[12] *= this.totalScaling;
    this.wrTransformScaled[13] *= this.totalScaling;
    this.wrTransformScaled[14] *= this.totalScaling;

    mat4.multiply(this.wrTransformAndTranform, this.wrTransformScaled,  this.transform);
    mat4.multiply(this.viewTransform, this.parent.viewTransform,  this.wrTransformAndTranform);
    mat4.multiply(this.projectionViewTransform, scene.camera.projectionTransform, this.viewTransform);
  }
};


Ngl.WrDock.prototype.updateTransformWithoutWrTransform = function(scene) {
  mat4.multiply(this.viewTransform, this.parent.viewTransform,  this.transform);
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
      Ngl.log('ERROR: Ngl.WrDock.anchorToScreen: Invalid option '+this.screenAnchor.anchor);
      return;
    }
  }

  scene.camera.add(this);

  mat4.identity(this.transform);
  mat4.translate(this.transform, this.transform, vec3.fromValues(x*pixelSize, y*pixelSize, -z));
  mat4.rotateX(this.transform, this.transform, Math.PI);
  this.transformUpdated = true;
  this.recalculatePosition = true;
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
