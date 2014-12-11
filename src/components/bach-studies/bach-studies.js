/**********************************************************************

File     : bach-studies.js
Project  : N Simulator Library
Purpose  : Source file for a bach studies component.
Revisions: Original definition by Lawrence Gunn.
           2014/12/06

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('wr3dApp').directive('bachStudies', [function() {
  return {
    restrict: 'E',
    templateUrl: 'src/components/bach-studies/bach-studies.html',
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$http', function (ComponentExtensions, $scope, $element, $attrs, $http) {
      ComponentExtensions.initialize(this, 'bachStudies', $scope, $element, $attrs);

      $scope.showStatus = false;
      $scope.simulation = { };

      var runOnServer = function(config) {
        $scope.showStatus = false;
        var url = 'http://localhost:3006?do='+encodeURIComponent(JSON.stringify(config));
        $http.get(url).success(function(data) {
          $scope.showStatus = true;
          $scope.success = true;
          $scope.simulation.data = data;

        }).error(function(err) {
          $scope.showStatus = true;
          $scope.success = false;
        });
      };

      $scope.run = function(config) {
        runOnServer(config);
      };
    }],
    link: function($scope, $element, $attrs, $ctrl) {
    }
  };
}]);
