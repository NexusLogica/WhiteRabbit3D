/**********************************************************************

File     : threejs-canvas.js
Project  : N Simulator Library
Purpose  : Source file for a threejs-canvas component.
Revisions: Original definition by Lawrence Gunn.
           2014/09/01
           Copied from pi-canvas3d in N by Lawrence Gunn.
           2015/02/08

Copyright (c) 2014-2015 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('wr3dApp').directive('threejsCanvas', [function() {
  return {
    restrict: 'E',
    scope: {
      scene: '=scene',
      initialCameraPosition: '=initialCameraPosition'
    },
    templateUrl: 'src/components/threejs-canvas/threejs-canvas.html',
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', function (ComponentExtensions, $scope, $element, $attrs) {
      ComponentExtensions.initialize(this, 'threejsCanvas', $scope, $element, $attrs);


    }],
    link: function($scope, $element, $attrs) {
      var useTrackingControls = $attrs.hasOwnProperty('useTrackingControls');

      $scope.stop = function() {
        $scope.stopRendering = !$scope.stopRendering;
      };

      var scene, camera, renderer;
      var pointerDetectRay, projector, mouse2D;
      var width, height;

      var initializeRenderer = function() {
        if(!Detector.webgl) {
          Detector.addGetWebGLMessage();
        }

        var target = $element.find('.render-target');
        width = target.width();
        height = target.height();

        renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        target.append(renderer.domElement);

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera( 75, target.width() / target.height(), 0.1, 1000 );
        if($scope.initialCameraPosition) {
          camera.position.copy($scope.initialCameraPosition);
        } else {
          camera.position.z = -3.0;
        }
        camera.updateMatrix();

        if(useTrackingControls) {
          var controls = new THREE.OrbitControls(camera, target[0]);
          controls.damping = 0.2;
          controls.addEventListener( 'change', function() {
            renderer.render( scene, camera );
          });
        }

        //pointerDetectRay = new THREE.Raycaster();
        //pointerDetectRay.ray.direction.set(0, -1, 0);
        //projector = new THREE.Projector();
        //mouse2D = new THREE.Vector3(0, 0, 0);

//        if($scope.scene) {
//          $scope.scene.build(scene, camera, renderer);
//        }
      };

      $scope.$watch('scene', function(newVal) {
        if($scope.scene) {
          scene.children = [];
          $scope.scene.build(scene, camera, renderer);
        }
      });

      var buildScene = function() {

      };

//      $scope.onMouseDown = function($event) {
//        $event.preventDefault();
//        mouse2D.x = ($event.clientX / $element.width()) * 2 - 1;
//        mouse2D.y = -($event.clientY / $element.height()) * 2 + 1;
//        var intersects = pointerDetectRay.intersectObjects(scene.children, true);
//
//        if (intersects.length > 0) {
//            var intersect = intersects[0];
//debugger;
//          console.log('yes');
//            // intersect is the object under your mouse!
//            // do what ever you want!
//        }
//      };

      var render = function () {
        requestAnimationFrame(render);
//        pointerDetectRay = projector.pickingRay(mouse2D.clone(), camera);
        renderer.render(scene, camera);
      };

      var startRenderLoop = function() {
        render();
      }

      initializeRenderer();
      startRenderLoop();

      $scope.$on('threejs-canvas:slide-grid', function($event, direction, d1, d2, d3) {
        $event.preventDefault();
        $scope.scene.slideGrid(direction, d1, d2, d3);
      });

    }
  };
}]);
