/**********************************************************************

File     : audioPlayer.js
Project  : N Simulator Library
Purpose  : Source file for a home page component.
Revisions: Original definition by Lawrence Gunn.
           2014/09/27

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('wr3dApp').directive('audioPlayer', [function() {
  return {
    restrict: 'E',
    templateUrl: 'src/components/audio-player/audio-player.html',
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$timeout', function (ComponentExtensions, $scope, $element, $attrs, $timeout) {
      ComponentExtensions.initialize(this, 'audioPlayer', $scope, $element, $attrs);

      $scope.next = function() {
        debugger;
      };
    }],
    link: function($scope, $element, $attrs, $ctrl) {
    }
  };
}]);
