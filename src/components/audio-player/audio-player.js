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

      $scope.count = 0;
      $scope.direction = 1.0;
      $scope.buttonText = 'Next';
      $scope.onNext = function() {
        $scope.buttonText = 'Other '+$scope.count;
        $scope.count++;
        var scene = $element.find('wr3d-scene').data('wr3d').wr3d.scene;
        var target = scene.getWrObjectById('main-content');
        var options = {
          duration: 1000,
          startValue: -60.0*$scope.direction,
          endValue: 60.0*$scope.direction,
          func: function(fraction) { return fraction; },
          style: 'position3d',
          styleString: 'translate(100px, -100px, 0px) rotateY(${0}deg)',
          target: target
        };
        var transition = new Ngl.Transition(scene, options);
        $scope.direction = -$scope.direction;
      };
    }],
    link: function($scope, $element, $attrs, $ctrl) {
    }
  };
}]);
