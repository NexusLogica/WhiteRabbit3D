/**********************************************************************

 File     : wr-host.js
 Project  : N Simulator Library
 Purpose  : Source file for a WhiteRabbit3D style.
 Revisions: Original definition by Lawrence Gunn.
            2014/11/28

 Copyright (c) 2014 by Lawrence Gunn
 All Rights Reserved.

 */
'use strict';

Ngl.nextWrHostId = 0;

angular.module('wr3dApp').directive('wrHost', [function() {
  return {
    restrict: 'E',
    controller: ['$scope', '$element', '$attrs', '$http', function ($scope, $element, $attrs, $http) {

      $element.css('position', 'relative');

      $scope.hostId = Ngl.nextWrHostId;
      Ngl.nextWrHostId++;
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

      $scope.$emit('wr-host:notify-host-container', $scope);

      $scope.getStyles = function(hostContainer) {
        $scope.wrStyle = {};
        _.forEach($scope.styleSelectors, function(id) {
          var style = hostContainer.getStyle(id);
          $scope.wrStyle = _.merge($scope.wrStyle, style);
        });

        var canvas = new Ngl.HtmlCanvas($element, $scope.wrStyle);
        var panel = new Ngl.WrPanel(canvas, $scope.wrStyle);
        hostContainer.scene.add(panel);
      };


//      scene.add(new Ngl.WrPanel({
//        name:         'song-title',
//        host:         '.wr3d-host.song-title-host',
//        position3d:   'translate(0px, 0px, 0px)',
//        display3d:    'surface',
//        scaling3d:    'screen',
////        surfaces3d:   [{ "type": "rectangular" }]
//        surfaces3d:   [{ "type": "circular", "radiusOuter": "300px", "angle": "full" }]
//      }));

    }],
    link: function($scope, $element, $attrs, $ctrl) {

    }
  };
}]);
