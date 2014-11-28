/**********************************************************************

 File     : standard-shaders.js
 Project  : N Simulator Library
 Purpose  : Source file for standard shaders.
 Revisions: Original definition by Lawrence Gunn.
            2014/11/28

 Copyright (c) 2014 by Lawrence Gunn
 All Rights Reserved.

 */
'use strict';

Ngl.FragmentShaders = Ngl.FragmentShaders || {};
Ngl.VertexShaders   = Ngl.VertexShaders   || {};

Ngl.VertexShaders.flatVertexShader = "                                      \n\
  // A basic flat vertex shader, hello world'esque.                         \n\
  uniform mat4 projectionViewMatrix;                                        \n\
  attribute vec2 position;                                                  \n\
                                                                            \n\
  void main() {                                                             \n\
    vec4 sizedPosition = vec4(position[0], position[1], 0.0, 1.0);          \n\
    gl_Position = projectionViewMatrix*sizedPosition;                       \n\
  }";

Ngl.FragmentShaders.flatFragmentShader = '                                  \n\
  // A basic flat fragment shader, hello worldesque.                        \n\
  uniform highp vec4 surfaceColor;                                          \n\
                                                                            \n\
  void main() {                                                             \n\
    gl_FragColor = surfaceColor;                                            \n\
  }';

Ngl.VertexShaders.textureVertexShader = '                                   \n\
  const int MAX_SURFACES = 4;                                               \n\
  struct surfaceData {                                                      \n\
    mat4 floatData;                                                         \n\
    mat4 transformBefore;                                                   \n\
    mat4 transformAfter;                                                    \n\
    ivec4 integerData;                                                      \n\
  };                                                                        \n\
  uniform surfaceData surfaceDataArray[MAX_SURFACES];                       \n\
                                                                            \n\
  const float NXGR_PI = 3.141592653589;                                     \n\
  const float NXGR_E  = 2.718281828459;                                     \n\
  uniform mat4 projectionViewMatrix;                                        \n\
  uniform vec3 size;                                                        \n\
  uniform float pixelSize;                                                  \n\
  uniform ivec4 flags;                                                      \n\
  uniform ivec4 instructions;                                               \n\
  attribute vec3 position;                                                  \n\
  attribute vec2 texCoord;                                                  \n\
  attribute vec2 selectionTexCoord;                                         \n\
                                                                            \n\
  varying vec2 texCoordVarying;                                             \n\
                                                                            \n\
  vec4 rectangularWarp(int dataIndex, vec4 posIn) {                         \n\
    vec4 pos = surfaceDataArray[dataIndex].transformBefore*posIn;           \n\
                                                                            \n\
    // surface data:                                                        \n\
    //   0,0: outer radius - radius in pixels.                              \n\
    float scaleX = surfaceDataArray[dataIndex].floatData[0][0];             \n\
    float scaleY = surfaceDataArray[dataIndex].floatData[0][1];             \n\
                                                                            \n\
    float x = posIn.x*scaleX;                                               \n\
    float y = posIn.y*scaleY;                                               \n\
    float z = posIn.z;                                                      \n\
                                                                            \n\
    return surfaceDataArray[dataIndex].transformAfter*vec4(x, y, z, 1.0);   \n\
  }                                                                         \n\
                                                                            \n\
  vec4 circularWarp(int dataIndex, vec4 posIn) {                            \n\
    vec4 pos = surfaceDataArray[dataIndex].transformBefore*posIn;           \n\
                                                                            \n\
    // surface data:                                                        \n\
    //   0,0: outer radius - radius in pixels.                              \n\
    float radiusOuter = surfaceDataArray[dataIndex].floatData[0][0];        \n\
                                                                            \n\
    float radius = radiusOuter+pos.y/pixelSize;                             \n\
    float xPixels = pos.x/pixelSize;                                        \n\
                                                                            \n\
    float angle = -xPixels/radiusOuter+90.0/180.0*NXGR_PI;                  \n\
    radius = radiusOuter*pow(NXGR_E, -(radiusOuter-radius)/radiusOuter);    \n\
    float x = radius*cos(angle)*pixelSize;                                  \n\
    float y = radius*sin(angle)*pixelSize;                                  \n\
    float z = pos[2];                                                       \n\
                                                                            \n\
    return surfaceDataArray[dataIndex].transformAfter*vec4(x, y, z, 1.0);   \n\
  }                                                                         \n\
                                                                            \n\
  void main() {                                                             \n\
    if(flags[0] == 0) {                                                     \n\
      texCoordVarying.x = texCoord.x;                                       \n\
      texCoordVarying.y = texCoord.y;                                       \n\
    }                                                                       \n\
    else if(flags[0] == 1) {                                                \n\
      texCoordVarying.x = selectionTexCoord.x;                              \n\
      texCoordVarying.y = selectionTexCoord.y;                              \n\
    }                                                                       \n\
                                                                            \n\
    vec4 sizedPosition = vec4(size[0]*position[0], size[1]*position[1], position[2], 1.0); \n\
    for(int i=0; i<4; i++) {                                                \n\
      if(instructions[i] == 0) {                                            \n\
        break;                                                              \n\
      } else if(instructions[i] == 2) {                                     \n\
        sizedPosition = circularWarp(i, sizedPosition);                     \n\
      }                                                                     \n\
    }                                                                       \n\
                                                                            \n\
    gl_Position = projectionViewMatrix*sizedPosition;                       \n\
  }';

Ngl.FragmentShaders.textureColorSelectFragmentShader = '                    \n\
  uniform highp vec4 surfaceColor;                                          \n\
                                                                            \n\
  void main() {                                                             \n\
    gl_FragColor = surfaceColor;                                            \n\
  }';

Ngl.FragmentShaders.textureTextureSelectFragmentShader = '                  \n\
  varying highp vec2 texCoordVarying;                                       \n\
  uniform sampler2D mainTexture;                                            \n\
                                                                            \n\
  void main() {                                                             \n\
    gl_FragColor = vec4(texture2D(mainTexture, texCoordVarying));           \n\
  }';

Ngl.VertexShaders.selectionTextureBuilderVertexShader = '                   \n\
  precision highp float;                                                    \n\
  uniform float width;         // The width of the bitmap in pixels.        \n\
  attribute vec2 position;                                                  \n\
  attribute vec2 increment;                                                 \n\
  varying vec2 xyCoordinate;                                                \n\
                                                                            \n\
  void main() {                                                             \n\
    gl_Position = vec4(position[0], position[1], 0.0, 1.0);                 \n\
    xyCoordinate = increment*width;                                         \n\
  }';

Ngl.FragmentShaders.selectionTextureBuilderFragmentShader = '               \n\
  precision highp float;                                                    \n\
  uniform float width;                                                      \n\
  varying vec2 xyCoordinate;                                                \n\
                                                                            \n\
  void main() {                                                             \n\
    float l = (xyCoordinate.y-0.5)*width+(xyCoordinate.x-0.5);              \n\
                                                                            \n\
    float r = floor(l*0.00001525878);          // divided by 256^2          \n\
    float g = floor((l-r*65536.0)*0.00390625); // divided by 256            \n\
    float b = floor(l-r*65536.0-g*256.0);                                   \n\
                                                                            \n\
    gl_FragColor = vec4(r/255.0, g/255.0, b/255.0, 1.0);                    \n\
  }';

Ngl.FragmentShaders.textureFragmentShader = "                               \n\
  // A basic flat fragment shader, hello world'esque.                       \n\
  varying highp vec2 texCoordVarying;                                       \n\
  uniform sampler2D mainTexture;                                            \n\
                                                                            \n\
  void main() {                                                             \n\
    gl_FragColor = vec4(texture2D(mainTexture, texCoordVarying));           \n\
  }";
