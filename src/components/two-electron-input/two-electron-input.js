/**********************************************************************

File     : two-electron-input.js
Project  : N Simulator Library
Purpose  : Source file for a betatron simulation input component.
Revisions: Original definition by Lawrence Gunn.
           2015/01/10

Copyright (c) 2015 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('wr3dApp').directive('twoElectronInput', [function() {
  return {
    restrict: 'E',
    scope: {
    },
    templateUrl: 'src/components/two-electron-input/two-electron-input.html',
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$http', '$timeout', function (ComponentExtensions, $scope, $element, $attrs, $http, $timeout) {
      ComponentExtensions.initialize(this, 'twoElectronInput', $scope, $element, $attrs);

      $scope.targetType = 'constantVelocity';
      $scope.unitAbbrev = {
        "meters": "m",
        "metres": "m",
        "seconds": "s"
      };

      $scope.simTypes = {
        constantVelocity: {
          name: "Constant velocity simulation",
          system: "twoElectronRelativity",
          inputs: [
            {
              arg: "electronSeparation",
              name: " Electron separation",
              description: "The initial separation of the two electrons",
              units: "meters",
              default: 0.1,
              min: 0.0,
              max: 5.0,
              step: 0.05,
              validate: function(d) { if(d <= 0.0) { return "The separation must be greater than zero"; } }
            },
            {
              arg: "observerSpeed",
              name: "Observer's speed",
              description: "The speed of the observer, +ve away from the electrons",
              units: "v/c",
              default: 10000.0,
              min: -299792458.0,
              max: 299792458.0,
              step: 10000,
              validate: function(s) { if(Math.abs(299792458.0) > 1.0) { return "The speed must be less than the speed of light"; } }
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
