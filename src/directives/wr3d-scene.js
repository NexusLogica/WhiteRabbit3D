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

      $scope.hostList = [];
      $scope.styleListPending = [];
      $scope.styleListLoaded = [];

      $scope.styles = {};

      var initializeCanvas = function() {
        $scope.scene = new Ngl.Scene();
        $scope.canvas.data('scene', $scope.scene);
        $scope.scene.initialize($scope.canvas);

        if($attrs.hasOwnProperty('clearColor')) {
          var clearColor = $attrs.clearColor;
          var colorVec = Ngl.vecFromString(clearColor);
          $scope.scene.setClearColor(colorVec);
        }

        function render() {
         requestAnimationFrame(render);
          $scope.scene.render();
        }

        render();
      };

      $scope.$on('wr3d-canvas:canvas-ready', function(event, canvas) {
        $scope.canvas = canvas;
        initializeCanvas();
        event.stopPropagation();
      });

      $scope.$on('wr3d:notify-scene', function(event, hostScope) {
        $scope.hostList.push(hostScope);
        event.stopPropagation();
      });

      $scope.$on('wr-style:notify-style', function(event, styleScope) {
        $scope.styleListPending.push(styleScope);
        event.stopPropagation();
      });

      $scope.$on('wr-style:notify-style-load-complete', function(event, styleScope, success) {
        var removed = _.remove($scope.styleListPending, styleScope);
        if(!removed || removed.length === 0) {
          Ngl.log('ERROR: Wr3d: Style load complete but style object wasn\'t registered');
        } else {
          $scope.styleListLoaded.push(styleScope);
          if($scope.styleListPending.length === 0) {
            $scope.onStylesLoaded();
          }
        }
        event.stopPropagation();
      });

      $scope.$on('wr-style:notify-style-loaded', function(event, styleScope) {

        event.stopPropagation();
      });

      $scope.onStylesLoaded = function() {
        Ngl.log('Num Hosts: '+$scope.hostList.length);
        Ngl.log('Num styles pending: '+$scope.styleListPending.length);
        Ngl.log('Num styles loaded: '+$scope.styleListLoaded.length);

        _.forEach($scope.styleListLoaded, function(styleObj) {
          _.merge($scope.styles, styleObj.styleJson.children);
        });

        $scope.$broadcast('wr3d-scene:get-styles', $scope);
      };

      $scope.getStyle = function(selector) {
        if($scope.styles.hasOwnProperty(selector)) {
          return $scope.styles[selector].attributes;
        }
        return {};
      };

    }],
    link: function($scope, $element, $attrs, $ctrl) {
      if($scope.styleListPending.length === 0) {
        $scope.onStylesLoaded();
      }
    }
  };
}]);
