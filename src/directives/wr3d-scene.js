/**********************************************************************

 File     : wr3d-scene.js
 Project  : WhiteRabbit3D
 Purpose  : Source file for a wr3d Html host container - i.e. the top level WR3D component.
 Revisions: Original definition by Lawrence Gunn.
            2014/11/29

 Copyright (c) 2014 by Lawrence Gunn
 All Rights Reserved.

 */
'use strict';

angular.module('wr3dApp').directive('wr3dScene', [function() {
  return {
    restrict: 'E',
    controller: ['$scope', '$element', '$attrs', '$http', function ($scope, $element, $attrs, $http) {
      $scope.wr3d = { type: 'wr3dScene' };

      $scope.wr3d.hostList = [];
      $scope.wr3d.styleListPending = [];
      $scope.wr3d.styleListLoaded = [];

      $scope.wr3d.styles = {};

      var initializeCanvas = function() {
        $scope.wr3d.scene = new Ngl.Scene();

        $scope.wr3d.canvas.data('scene', $scope.wr3d.scene);
        $scope.wr3d.scene.initialize($scope.wr3d.canvas);
        $element.data('wr3d', $scope);

        if($attrs.hasOwnProperty('clearColor')) {
          var clearColor = $attrs.clearColor;
          var colorVec = Ngl.vecFromString(clearColor);
          $scope.wr3d.scene.setClearColor(colorVec);
        }

        function render() {
         requestAnimationFrame(render);
          $scope.wr3d.scene.render();
        }

        render();
      };

      $scope.$on('wr3d-canvas:canvas-ready', function(event, canvas) {
        $scope.wr3d.canvas = canvas;
        initializeCanvas();
        event.stopPropagation();
      });

      $scope.$on('wr3d:notify-scene', function(event, hostScope) {
        $scope.wr3d.hostList.push(hostScope);
        event.stopPropagation();
      });

      $scope.$on('wr-style:notify-style', function(event, styleScope) {
        $scope.wr3d.styleListPending.push(styleScope);
        event.stopPropagation();
      });

      $scope.$on('wr-style:notify-style-load-complete', function(event, styleScope, success) {
        var removed = _.remove($scope.wr3d.styleListPending, styleScope);
        if(!removed || removed.length === 0) {
          Ngl.log('ERROR: Wr3d: Style load complete but style object wasn\'t registered');
        } else {
          $scope.wr3d.styleListLoaded.push(styleScope);
          if($scope.wr3d.styleListPending.length === 0) {
            $scope.onStylesLoaded();
          }
        }
        event.stopPropagation();
      });

      $scope.$on('wr-style:notify-style-loaded', function(event, styleScope) {

        event.stopPropagation();
      });

      $scope.onStylesLoaded = function() {
        Ngl.log('Num Hosts: '+$scope.wr3d.hostList.length);
        Ngl.log('Num styles pending: '+$scope.wr3d.styleListPending.length);
        Ngl.log('Num styles loaded: '+$scope.wr3d.styleListLoaded.length);

        _.forEach($scope.wr3d.styleListLoaded, function(styleObj) {
          _.merge($scope.wr3d.styles, styleObj.styleJson);
        });

        $scope.$broadcast('wr3d-scene:get-styles', $scope);
      };

      $scope.getStyle = function(selector) {
        if($scope.wr3d.styles.hasOwnProperty(selector)) {
          return $scope.wr3d.styles[selector];
        }
        return {};
      };

    }],
    link: function($scope, $element, $attrs, $ctrl) {
      if($scope.wr3d.styleListPending.length === 0) {
        $scope.onStylesLoaded();
      }
    }
  };
}]);
