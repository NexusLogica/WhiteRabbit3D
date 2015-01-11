/**********************************************************************

 File     : wr3d-style.js
 Project  : N Simulator Library
 Purpose  : Source file for a WhiteRabbit3D style.
 Revisions: Original definition by Lawrence Gunn.
            2014/11/28

 Copyright (c) 2014 by Lawrence Gunn
 All Rights Reserved.

 */
'use strict';

Ngl.nextWrStyleId = 0;

angular.module('wr3dApp').directive('wr3dStyle', [function() {
  return {
    restrict: 'E',
    controller: ['$scope', '$element', '$attrs', '$http', function ($scope, $element, $attrs, $http) {

      $scope.styleId = Ngl.nextWrStyleId;
      Ngl.nextWrStyleId++;

      $scope.$emit('wr-style:notify-style', $scope);

      var url = $attrs.wrImport;
      if(url) {
        $http.get(url).success(function (data) {

          $scope.styleJson = data;
          Ngl.log($scope.styleJson);
          $scope.$emit('wr-style:notify-style-load-complete', $scope, true);

        }).error(function (err) {

          Ngl.log('ERROR: Wr3d: Unable to load style ' + err);
          $scope.$emit('wr-style:notify-style-load-complete', $scope, false);

        });
      }
    }],
    link: function($scope, $element, $attrs, $ctrl) {
    }
  };
}]);
