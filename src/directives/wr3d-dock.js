/**********************************************************************

 File     : wr3d-dock.js
 Project  : N Simulator Library
 Purpose  : Source file for a WhiteRabbit3D style.
 Revisions: Original definition by Lawrence Gunn.
            2014/11/28

 Copyright (c) 2014 by Lawrence Gunn
 All Rights Reserved.

 */
'use strict';

Ngl.nextWr3dDockId = 0;

angular.module('wr3dApp').directive('wr3dDock', [function() {
  return {
    restrict: 'E',
    scope: { },
    controller: ['$scope', '$element', '$attrs', '$timeout', '$parse', function ($scope, $element, $attrs, $timeout, $parse) {

      $scope.noShow = false;
      if($attrs.hasOwnProperty('wr3dDisplay')) {
        var template = $parse($attrs.wr3dDisplay);
        var value = template($scope);
        if(!value) {
          $scope.noShow = true;
          $element.css({ display: 'none' });
          return;
        }
      }

      // TODO: Find a proper value for 'top'
      $element.css({ 'display': 'none' });

      $scope.hostId = Ngl.nextWr3dDockId;
      Ngl.nextWr3dDockId++;
      $scope.styleSelectors = [];

    }],
    link: function($scope, $element, $attrs, $ctrl) {

      if($scope.noShow) {
        return;
      }

      $element.data('wr3d', $scope);

      $scope.wr3d = { type: 'wr3dDock' };

      var getWrStyleSelectors = function() {
        var className = $element.attr('class');
        if (className) {
          $scope.wr3d.styleSelectors = className.split(' ').reverse();
          for(var i=0; i < $scope.wr3d.styleSelectors.length; i++) {
            $scope.wr3d.styleSelectors[i] = '.'+$scope.wr3d.styleSelectors[i];
          }
        }
      };

      getWrStyleSelectors();

      $scope.$emit('wr3d:notify-scene', $scope);

      $scope.$on('wr3d-scene:get-styles', function(event, hostContainer) {
        $scope.wrStyle = {};
        _.forEach($scope.wr3d.styleSelectors, function(id) {
          var style = hostContainer.getStyle(id);
          $scope.wrStyle = _.merge($scope.wrStyle, style);
        });

        $scope.dock = new Ngl.WrDock($scope.wrStyle);
        if($attrs.wrName) {
          $scope.dock.name = $attrs.wrName;
        }

        hostContainer.scene.camera.add($scope.dock);
        $scope.dock.initialize(hostContainer.scene.gl, hostContainer.scene);
      });

      $element.addClass('wr3d-dock');
    }
  };
}]);
