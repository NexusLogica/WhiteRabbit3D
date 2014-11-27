/**********************************************************************

File     : layout-tree.js
Project  : N Simulator Library
Purpose  : Source file for a position and size map for an HTML element.
Revisions: Original definition by Lawrence Gunn.
           2014/11/23

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

Ngl.LayoutTree = function(element, topX, topY) {
  this.element = element;

  this.x = (element.offsetLeft - element.scrollLeft + element.clientLeft)+topX;
  this.y = (element.offsetTop - element.scrollTop + element.clientTop)+topY;
  this.right  = element.offsetWidth+this.x;
  this.bottom = element.offsetHeight+this.y;
  this.children = [];
  this.id = element.nodeName+'/'+element.className;

  var children = this.element.children;
  for(var i=0; i<children.length; i++) {
    var child = new Ngl.LayoutTree(children[i], topX, topY);
    this.children.push(child);
  }
};

Ngl.LayoutTree.prototype.findTarget = function(x, y, mouseOvers) {
  var mouseIsInsideSelf = false;
  if (x >= this.x && y >= this.y && x <= this.right && y <= this.bottom) {
    mouseIsInsideSelf = true;
    mouseOvers.push(this);
  }

  for(var i=0; i<this.children.length; i++) {
    var child = this.children[i];
    var target = child.findTarget(x, y, mouseOvers);
    if(target) {
      return target;
    }
  }

  return mouseIsInsideSelf ? this : undefined;
};

/***
 * Returns a string representing the layout tree in formatted JSON notation. Used for debugging.
 * @method toJSON
 * @returns {String}
 */
Ngl.LayoutTree.prototype.toJSON = function() {
  var nodePluck = function(node) {
    var data = _.pick(node,['x', 'y', 'right', 'bottom', 'id']);
    var children = [];
    for(var i=0; i<node.children.length; i++) {
      children.push(nodePluck(node.children[i]));
    }
    if(children.length) { data.children = children; }
    return data;
  };
  var cleanNodes = nodePluck(this.layoutTree);
  return JSON.stringify(cleanNodes, undefined, 2);
}
