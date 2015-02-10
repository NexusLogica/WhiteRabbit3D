/**********************************************************************

File     : circuit-field-input.js
Project  : N Simulator Library
Purpose  : Source file for a betatron simulation input component.
Revisions: Original definition by Lawrence Gunn.
           2015/02/08

Copyright (c) 2015 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('wr3dApp').directive('circuitFieldInput', [function() {
  return {
    restrict: 'E',
    scope: {
    },
    templateUrl: 'src/components/circuit-field-input/circuit-field-input.html',
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$http', '$timeout', function (ComponentExtensions, $scope, $element, $attrs, $http, $timeout) {
      ComponentExtensions.initialize(this, 'circuitFieldInput', $scope, $element, $attrs);

      $scope.targetType = 'staticCircuitField';
      $scope.unitAbbrev = {
        "meters": "m",
        "metres": "m",
        "seconds": "s"
      };

      $scope.simTypes = {
        staticCircuitField: {
          name: "Constant velocity",
          system: "twoElectronRelativity",
          inputs: [
            {
              arg: "width",
              name: " Circuit Width",
              description: "Circuit's width",
              units: "meters",
              default: 0.1,
              min: 0.001,
              max: 5.0,
              step: 0.01,
              onChange: function(value) { $scope.circuit.width = value; $scope.circuit.update(); },
              validate: function(d) { if(d <= 0.0) { return "The width must be greater than zero"; } }
            },
            {
              arg: "length",
              name: " Circuit length",
              description: "Circuit's width",
              units: "meters",
              default: 0.1,
              min: 0.001,
              max: 5.0,
              step: 0.01,
              onChange: function(value) { $scope.circuit.length = value; $scope.circuit.update(); },
              validate: function(d) { if(d <= 0.0) { return "The length must be greater than zero"; } }
            },
            {
              arg: "distanceFromChargeAxis",
              name: "Distance From Charge Axis",
              description: "Distance from the charge perpendicular to the axis",
              units: "meters",
              default: 0.25,
              min: -10.0,
              max: 10.0,
              step: 0.05,
              validate: function() { }
            },
            {
              arg: "distanceAlongChargeAxis",
              name: "Distance Along Charge Axis",
              description: "Distance along the charge in the direction of the axis",
              units: "meters",
              default: 0.0,
              min: -10.0,
              max: 10.0,
              step: 0.05,
              validate: function() { }
            }
          ]
        }
      };

      $scope.updateInputType = function(index, arg) {
        var input = $scope.simTypes[$scope.targetType].inputs[index];
        if(input.onChange) {
          input.onChange($scope.model[arg]);
        }
      };

      $scope.setElectricField = function() {
        $scope.field = new Bach.ElectricField();
        $scope.grid  = new Bach.FieldGrid();
        $scope.grid.grid = new THREE.Vector3(3, 3, 3);
        $scope.circuit = new Bach.RectangularCircuit();
        $scope.scene = new Bach.FieldScene();
        $scope.scene.setFieldAndGrid($scope.field, $scope.grid);
        $scope.scene.addCharge(new THREE.Vector3(0.0, 0.0, 0.0), -1.0);
        $scope.scene.addGraphic($scope.circuit);
      };

      $scope.initRunType = function() {
        $scope.model = $scope.model || {};
        _.forEach($scope.simTypes[$scope.targetType].inputs, function(input){
          if(!$scope.model.hasOwnProperty(input.arg)) {
            $scope.model[input.arg] = input.default;
            if(input.onChange) {
              input.onChange(input.default);
            }
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
      $scope.setElectricField();
      $scope.initRunType();
    }
  };
}]);
