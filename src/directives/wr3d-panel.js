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
    controller: ['$scope', '$element', '$attrs', '$timeout', function ($scope, $element, $attrs, $timeout) {

      // TODO: Find a proper value for 'top'
      $element.css({ 'position': 'fixed', 'top': '-2000px', 'left': '0px' });

      $scope.hostId = Ngl.nextWr3dPanelId;
      Ngl.nextWr3dPanelId++;
      $scope.styleSelectors = [];

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

      $scope.$emit('wr3d-panel:notify-scene', $scope);

      $scope.getStyles = function(hostContainer) {
        $scope.wrStyle = {};
        _.forEach($scope.styleSelectors, function(id) {
          var style = hostContainer.getStyle(id);
          $scope.wrStyle = _.merge($scope.wrStyle, style);
        });

        $scope.canvas = new Ngl.HtmlCanvas($element, $scope.wrStyle);
        $scope.panel = new Ngl.WrPanel($scope.canvas, $scope.wrStyle);
        hostContainer.scene.add($scope.panel);
      };

      //$scope.updateTexture = function() {
      //  $timeout(function() {
      //    $scope.canvas.setUpdateRequired(true);
      //  }, 0);
      //};

    }],
    link: function($scope, $element, $attrs, $ctrl) {
      $element.addClass('wr3d-panel');
      $element.on('click', function() {

      });
    }
  };
}]);
