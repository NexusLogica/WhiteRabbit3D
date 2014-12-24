/**********************************************************************

 File     : wr3d-panel.js
 Project  : N Simulator Library
 Purpose  : Source file for a WhiteRabbit3D style.
 Revisions: Original definition by Lawrence Gunn.
            2014/11/28

 Copyright (c) 2014 by Lawrence Gunn
 All Rights Reserved.

 */
'use strict';

Ngl.nextWr3dPanelId = 0;

angular.module('wr3dApp').directive('wr3dPanel', [function() {
  return {
    restrict: 'E',
    scope: { },
    controller: ['$scope', '$element', '$attrs', '$timeout', '$parse', function ($scope, $element, $attrs, $timeout, $parse) {
      $scope.componentName = 'wr3dPanel';

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
      $element.css({ 'position': 'fixed', 'top': '-2000px', 'left': '0px' });

      $scope.hostId = Ngl.nextWr3dPanelId;
      Ngl.nextWr3dPanelId++;
      $scope.styleSelectors = [];

    }],
    link: function($scope, $element, $attrs, $ctrl) {

      if($scope.noShow) {
        return;
      }

      $element.data('wr3d', $scope);
      $element.find('>div').data('wr3d', $scope);

      var getWrStyleSelectors = function() {
        var className = $element.find('>div').attr('class');
        if (className) {
          $scope.styleSelectors = className.split(' ').reverse();
          for(var i=0; i < $scope.styleSelectors.length; i++) {
            $scope.styleSelectors[i] = '.'+$scope.styleSelectors[i];
          }
        }
      };

      getWrStyleSelectors();

      $scope.$emit('wr3d:notify-scene', $scope);

      $scope.$on('wr3d-scene:get-styles', function(event, hostContainer) {
        $scope.wrStyle = {};
        _.forEach($scope.styleSelectors, function(id) {
          var style = hostContainer.getStyle(id);
          $scope.wrStyle = _.merge($scope.wrStyle, style);
        });

        $scope.canvas = new Ngl.HtmlCanvas($element, $scope.wrStyle);
        $scope.panel = new Ngl.WrPanel($scope.canvas, $scope.wrStyle);
        $scope.wrObject = $scope.panel;
        if($attrs.wrName) {
          $scope.panel.name = $attrs.wrName;
        }

        var parentString = $scope.wrStyle['-wr3d-parent3d'];
        if(!_.isEmpty(parentString)) {
          var wr3dScope = $(parentString).data('wr3d');
          if(wr3dScope && wr3dScope.wrObject) {
            wr3dScope.wrObject.add($scope.panel);
          }
        } else {
          hostContainer.scene.add($scope.panel);
        }
      });

      $element.addClass('wr3d-panel');
    }
  };
}]);
