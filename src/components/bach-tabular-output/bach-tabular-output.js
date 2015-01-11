/**********************************************************************

File     : bach-tabular-output.js
Project  : N Simulator Library
Purpose  : Source file for a bach studies component.
Revisions: Original definition by Lawrence Gunn.
           2014/12/09

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('wr3dApp').directive('bachTabularOutput', [function() {
  return {
    restrict: 'E',
    scope: {
      data: '=simulationData'
    },
    templateUrl: 'src/components/bach-tabular-output/bach-tabular-output.html',
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$http', function (ComponentExtensions, $scope, $element, $attrs, $http) {
      ComponentExtensions.initialize(this, 'bachTabularOutput', $scope, $element, $attrs);

      $scope.showStatus = false;

      $scope.format = function(val, index) {
        if(index === 5) {
          return sprintf('%5.5f', val);
        }
        return sprintf('%5.5e', val);
      };

      $scope.isAbs = function(name) {
        if(name.indexOf('|') >= 0) {
          return true;
        }
        return false;
      };

      $scope.cleanName = function(name) {
        return $.trim(name.replace(/\|/g, ''));
      };

      $scope.cleanUnits = function(units) {
        return $.trim(units.replace(/\|/g, ''));
      };

      $scope.onDependentSelect = function(row, column) {
        //debugger;
      };

      var combineDataToMatrix = function(source) {
        var rows = [];
        var t = source.independent.values;
        var d = source.dependent;
        var numDep = d.length;
        for (var i = 0; i < t.length; i++) {
          var ar = [t[i]];
          for (var j = 0; j < numDep; j++) {
            ar.push(d[j].values[i]);
          }
          rows.push(ar);
        }
        return rows;
      };

      $scope.$watch('data', function(newValue) {
        if(newValue) {
          $scope.dataSources = [];
          if($scope.data.state) {
            $scope.dataSources.push({
              name: "State data",
              data: combineDataToMatrix($scope.data.state),
              original: $scope.data.state
            });
          }
          if($scope.data.additional) {
            $scope.dataSources.push({
              name: "Additional data",
              data: combineDataToMatrix($scope.data.additional),
              original: $scope.data.additional
            });
          }
        }
      });

    }],
    link: function($scope, $element, $attrs, $ctrl) {
    }
  };
}]);
