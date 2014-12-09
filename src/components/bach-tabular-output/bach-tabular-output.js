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



    }],
    link: function($scope, $element, $attrs, $ctrl) {
    }
  };
}]);
