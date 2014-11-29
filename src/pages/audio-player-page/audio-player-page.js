/**********************************************************************

File     : audio-player-page.js
Project  : N Simulator Library
Purpose  : Source file for the audio player page.
Revisions: Original definition by Lawrence Gunn.
           2014/11/28

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('wr3dApp').directive('audioPlayerPage', [function() {
  return {
    restrict: 'E',
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$timeout', function (ComponentExtensions, $scope, $element, $attrs, $timeout) {
      ComponentExtensions.initialize(this, 'audioPlayerPage', $scope, $element, $attrs);

    }],
    link: function($scope, $element, $attrs, $ctrl) {

    }
  };
}]);
