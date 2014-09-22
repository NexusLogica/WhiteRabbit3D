/**********************************************************************

File     : perspective.js
Project  : N Simulator Library
Purpose  : Source file for perspective view matrix calculations.
Revisions: Original definition by Lawrence Gunn.
           2014/09/21

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var Ngl = Ngl || {};

Ngl.Perspective = function() {

  // Work arrays.
  this.va = vec3.create();
  this.vb = vec3.create();
  this.vc = vec3.create();
  this.vr = vec3.create();
  this.vu = vec3.create();
  this.vn = vec3.create();
  this.m  = mat4.create();
  this.perpPerspective   = mat4.create(); // The perpendicular perspective - a working matrix.

  var perspective = function(
    out,    // mat4 that will contain the perspective matrix
    left,   // x min
    right,  // x max
    bottom, // y min
    top,    // y max
    n,      // near plane
    f       // far plane
  ) {
    out[0]  = 2.0*n/(right-left);
    out[1]  = 0.0;
    out[2]  = 0.0;
    out[3]  = 0.0;
    out[4]  = 0.0;
    out[5]  = 2.0*n/(top-bottom);
    out[6]  = 0.0;
    out[7]  = 0.0;
    out[8]  = (right+left)/(right-left);
    out[9]  = (top+bottom)/(top-bottom);
    out[10] = -(f+n)/(f-n);
    out[11] = -1.0;
    out[12] = 0.0;
    out[13] = 0.0;
    out[14] = -2.0*f*n/(f-n);
    out[16] = 0.0;
  }

  /***
   * This fills the mat4 output matrix 'out' with the offset perspective.
   * @param out
   * @param pa
   * @param pb
   * @param pc
   * @param pe
   * @param n
   * @param f
   */
  var offsetPerspective = function(
    out, // mat4 that will contain the perspective matrix
    pa,  // vec3 - lower left position
    pb,  // vec3 - lower right position
    pc,  // vec3 - upper left position
    pe,  // vec3 - eye position (i.e. the origin)
    n,   // near plane distance
    f    // far plane distance
  ) {
    // Compute an orthonormal basis for the screen.
    vec3.subtract(_this.vr, pb, pa);
    vec3.subtract(_this.vu, pc, pa);

    vec3.normalize(_this.vr, _this.vr);
    vec3.normalize(_this.vu, _this.vu);
    vec3.cross(_this.vn, _this.vr, _this.vu);
    vec3.normalize(_this.vn, _this.vn);

    // Compute the screen corner vectors.
    vec3.subtract(_this.va, pa, pe);
    vec3.subtract(_this.vb, pb, pe);
    vec3.subtract(_this.vc, pc, pe);

    // Find the distance from the eye to screen plane.
    var d = -vec3.dot(_this.va, _this.vn);

    // Find the extent of the perpendicular projection.
    var nOverD = n/d;
    var l = vec3.dot(_this.vr, _this.va)*nOverD;
    var r = vec3.dot(_this.vr, _this.vb)*nOverD;
    var b = vec3.dot(_this.vu, _this.va)*nOverD;
    var t = vec3.dot(_this.vu, _this.vc)*nOverD;

    perspective(_this.perpPerspective , l, r, b, t, n, f);

    // Rotate the projection to be non-perpendicular.
    mat4.identity(_this.m);

    _this.m[0] = _this.vr[0]; _this.m[4] = _this.vr[1]; _this.m[ 8] = _this.vr[2];
    _this.m[1] = _this.vu[0]; _this.m[5] = _this.vu[1]; _this.m[ 9] = _this.vu[2];
    _this.m[2] = _this.vn[0]; _this.m[6] = _this.vn[1]; _this.m[10] = _this.vn[2];

    _this.m[15] = 1.0;

    mat4.multiply(out, _this.perspective, _this.m);

    // Move the apex of the frustum to the origin.
    out[12] -= pe[0];
    out[13] -= pe[1];
    out[14] -= pe[2];
  }

  return {
    perspective: perspective,
    offsetPerspective: offsetPerspective
  }
};
