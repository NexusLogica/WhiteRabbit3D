/**********************************************************************

 File     : wr-host.js
 Project  : N Simulator Library
 Purpose  : Source file for a WhiteRabbit3D style.
 Revisions: Original definition by Lawrence Gunn.
            2014/11/28

 Copyright (c) 2014 by Lawrence Gunn
 All Rights Reserved.

 */
'use strict';

angular.module('wr3dApp').directive('wrHost', [function() {
  return {
    restrict: 'E',
    controller: ['$scope', '$element', '$attrs', '$http', function ($scope, $element, $attrs, $http) {

    }],
    link: function($scope, $element, $attrs, $ctrl) {
//      scene.add(new Ngl.WrPanel({
//        name:         'song-title',
//        host:         '.wr3d-host.song-title-host',
//        position3d:   'translate(0px, 0px, 0px)',
//        display3d:    'surface',
//        scaling3d:    'screen',
////        surfaces3d:   [{ "type": "rectangular" }]
//        surfaces3d:   [{ "type": "circular", "radiusOuter": "300px", "angle": "full" }]
//      }));

    }
  };
}]);
