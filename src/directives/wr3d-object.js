/**********************************************************************

 File     : wr3d-object.js
 Project  : N Simulator Library
 Purpose  : Source file for a WhiteRabbit3D style.
 Revisions: Original definition by Lawrence Gunn.
            2014/12/18

 Copyright (c) 2014 by Lawrence Gunn
 All Rights Reserved.

 */
'use strict';

angular.module('wr3dApp').directive('wr3dObject', [function() {
  return {
    restrict: 'E',
    scope: { },
    controller: ['$scope', '$element', '$attrs', '$timeout', '$parse', function ($scope, $element, $attrs, $timeout, $parse) {
      $scope.wr3d = { type: 'wr3dObject' };

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

      $scope.hostId = Ngl.nextWr3dObjectId;
      Ngl.nextWr3dObjectId++;

    }],
    link: function($scope, $element, $attrs, $ctrl) {

      if($scope.noShow) {
        return;
      }

      $element.data('wr3d', $scope);

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

        var objectTypeString = $scope.wrStyle['-wr3d-object3d'];
        if(!_.isEmpty(objectTypeString)) {
          var properties = Ngl.parseBracketedStyle(objectTypeString);
          if(!_.isEmpty(properties.type)) {
            switch(properties.type) {
              case 'cube':
              case 'cuboid': {
                $scope.wrObject = new Ngl.Cuboid($scope.wrStyle);
              }
            }

            if($attrs.wrName) {
              $scope.wrObject.name = $attrs.wrName;
            }

            var parent = getParentWrScope();
            if(parent.wr3d.type === "wr3dDock") {
              var parentDock = parent.dock;
              parentDock.add($scope.wrObject);
            }
          }
        }
      });

      var getParentWrScope = function() {
        var elem = $element;
        while(true) {
          if(elem.parent().length === 0) {
            return undefined;
          }
          if(elem.parent().data('wr3d')) {
            var parentScope = elem.parent().data('wr3d');
            return parentScope;
          }
          elem = elem.parent();
        }
      };

      $element.addClass('wr3d-object');
    }
  };
}]);
