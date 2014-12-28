/**********************************************************************

File     : transition.js
Project  : N Simulator Library
Purpose  : Source file for a transition object.
Revisions: Original definition by Lawrence Gunn.
           2014/10/27

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

/***
 *
 * @method Ngl.Transition
 * @param scene
 * @param config
 * @constructor
 */
Ngl.Transition = function(scene, options) {
  this.options = options;
  this.startTime = scene.addTransition(this);
  this.endTime = this.startTime+this.options.duration;
  this.ease = vec4.fromValues(0.250, 0.100, 0.250, 1.000);
};

Ngl.Transition.prototype.beforeRender = function(scene, time) {
  var last = (time >= this.endTime);
  var fraction = 1.0;
  if(!last) {
    fraction = Ngl.Transition.cubicSpline((time-this.startTime)/this.options.duration, 0.05, 0.95);
  }
  var value = fraction*(this.options.endValue-this.options.startValue)+this.options.startValue;
  var styleValue = this.options.styleString.replace('${0}', value);
  this.options.target.style(this.options.style, styleValue);
  return !last;
};

Ngl.Transition.cubicSpline = function(t, y1, y2) {
  var cy = 3 * y1;
  var by = 3 * (y2 - y1) - cy;
  var ay = 1 - cy - by;

  return t * (cy + t * (by + t * ay));
};
