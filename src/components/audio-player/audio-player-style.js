/**********************************************************************

File     : audio-player.wrcss
Project  : WhiteRabbit3D audio player
Purpose  : Source file for WR3D css declarations.
Revisions: Original definition by Lawrence Gunn.
           2014/11/28

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var style = {
  "page-anchor": {
    /* screen-anchor implies it"s root is the camera frame */
    /* -wr3d-screen-anchor: 1.2 upper-left; */
    "-wr3d-parent3d": "screen 1.25 center"
  },

  "anchor-cube": {
    "-wr3d-object3d": {
      type: "cube",
      size: "10px",
      color: "#FF0000",
    "-wr3d-position3d": "rotateY(0deg)"
  },

  "latin-panel": {
    "-wr3d-parent3d": "main-dock",
    "-wr3d-position3d": "translate(100px, 0px, 100px) rotateY(-30deg)",
    "-wr3d-display3d": "surface",
    "-wr3d-scaling3d": "screen",
    "-wr3d-surface3d": {
      "type": "circular",
      "radius-outer": "200px",
      "angle": "full",
      "before": "translate(100px, -100px, 0px)"
  },

  "main-content": {
    "-wr3d-parent3d": "main-dock",
    "-wr3d-position3d": "translate(100px, -100px, 0px) rotateY(-60deg)",
    "-wr3d-display3d": "surface",
    "-wr3d-scaling3d": "screen",
    "-wr3d-surface3d": { "type": "rectangular" }
  },

  "child-content": {
    "-wr3d-parent3d": "main-content",
    "-wr3d-position3d": "translate(100px, -200px, 100px) rotateY(0deg)",
    "-wr3d-display3d": "surface",
    "-wr3d-scaling3d": "screen",
    "-wr3d-surface3d": "( type: rectangular )"
  },

  "child-panel": {
    "-wr3d-parent3d": "main-content",
    "-wr3d-position3d": "rotateX(0deg) translate(0px, 0px, 0px)",
    "-wr3d-display3d": "surface",
    "-wr3d-scaling3d": "screen",
    "-wr3d-surface3d": "( type: rectangular )"
  }
};
