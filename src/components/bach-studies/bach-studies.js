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

      var runOnServer = function(command) {
        $scope.showStatus = false;
        $http.get('http://localhost:3006?do='+encodeURIComponent(command)).success(function(data) {
          $scope.showStatus = true;
          $scope.success = true;
        }).error(function(err) {
          $scope.showStatus = true;
          $scope.success = false;
        });
      };

      $scope.run = function() {
        var command = '{ "system": "Betatron", "command": "dynamic-sim" }';
        runOnServer(command);
      };
    }],
    link: function($scope, $element, $attrs, $ctrl) {
    }
  };
}]);
