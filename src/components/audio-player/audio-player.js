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

      $scope.count =0;
      $scope.buttonText = 'Next';
      $scope.onNext = function() {
        $scope.buttonText = 'Other '+$scope.count;
        $scope.count++;
        if($scope.count === 1) {
          var scene = $element.find('wr3d-scene').data('wr3d').wr3d.scene;
          var target = scene.getWrObjectById('main-content');
          var options = {
            duration: 5000,
            startValue: -30.0,
            endValue: 30.0,
            func: function(fraction) { return fraction; },
            style: '-wr3d-position3d',
            styleString: 'translate(100px, -100px, 0px) rotateY(${0}deg)',
            target: target
          };
          var transition = new Ngl.Transition(scene, options);
        }
      };
    }],
    link: function($scope, $element, $attrs, $ctrl) {
    }
  };
}]);
