/**********************************************************************

File     : betatron-input.js
Project  : N Simulator Library
Purpose  : Source file for a betatron simulation input component.
Revisions: Original definition by Lawrence Gunn.
           2014/12/10

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('wr3dApp').directive('betatronInput', [function() {
  return {
    restrict: 'E',
    scope: {
    },
    templateUrl: 'src/components/betatron-input/betatron-input.html',
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$http', '$timeout', function (ComponentExtensions, $scope, $element, $attrs, $http, $timeout) {
      ComponentExtensions.initialize(this, 'betatronInput', $scope, $element, $attrs);

      $scope.targetType = 'radiusAndSpeed';
      $scope.unitAbbrev = {
        "meters": "m",
        "metres": "m",
        "seconds": "s"
      };

      $scope.simTypes = {
        radiusAndSpeed: {
          name: "Run from radius and speed",
          system: "betatron",
          inputs: [
            {
              arg: "radius",
              name: " Trajectory radius",
              description: "The radius the electron initially travels on",
              units: "meters",
              default: 0.1,
              min: 0.0,
              max: 5.0,
              step: 0.05,
              validate: function(r) { if(r < 0.0) { return "Radius must be greater than zero"; } }
            },
            {
              arg: "speed",
              name: "Initial speed",
              description: "The electron initial speed as a fraction of the speed of light",
              units: "v/c",
              default: 0.01,
              min: -1.0,
              max: 1.0,
              step: 0.05,
              validate: function(s) { if(Math.abs(s) > 1.0) { return "The speed must be less than the speed of light"; } }
            },
            {
              arg: "fieldIncrease",
              name: "Field change rate",
              description: "Rate of change of the magnetic field in terms of fractional change   per rotation",
              units: "T/s",
              default: 0.0,
              min: -1.0,
              max: 1.0,
              step: 0.05,
              validate: function(s) { }
            }
          ]
        }
      };

      $scope.initRunType = function() {
        $scope.model = $scope.model || {};
        _.forEach($scope.simTypes[$scope.targetType].inputs, function(input){
          if(!$scope.model.hasOwnProperty(input.arg)) {
            $scope.model[input.arg] = input.default;
          }
        });

        $timeout(function() {
          $element.find('[data-toggle="popover"]').popover({
            trigger: 'hover',
            placement: 'right'
          });
        }, 0);
      };

      $scope.formatUnits = function(units) {
        return '('+($scope.unitAbbrev[units] ? $scope.unitAbbrev[units] : units) +')';
      };

      $scope.inputs = {};

      $scope.run = function() {
        var target = $scope.simTypes[$scope.targetType];
        var config = {
          system: target.system,
          method: $scope.targetType,
          inputs: {}
        };

        _.forEach(target.inputs, function(input) {
          config.inputs[input.arg] = $scope.model[input.arg];
        });
        $scope.piParentComponent.run(config);
      };

    }],
    link: function($scope, $element, $attrs, $ctrl) {
      $scope.initRunType();

    }
  };
}]);
