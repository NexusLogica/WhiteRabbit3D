/**********************************************************************

 File     : wr-style.js
 Project  : N Simulator Library
 Purpose  : Source file for a WhiteRabbit3D style.
 Revisions: Original definition by Lawrence Gunn.
            2014/21/28

 Copyright (c) 2014 by Lawrence Gunn
 All Rights Reserved.

 */
'use strict';

angular.module('wr3dApp').directive('wrStyle', [function() {
  return {
    restrict: 'E',
    controller: ['$scope', '$element', '$attrs', '$http', function ($scope, $element, $attrs, $http) {
      var url = $attrs['wr-url'];
      $http.get(url).success(function(data) {
        Ngl.log("GOT "+data);
      }).error(function(err) {
        Ngl.log("ERROR "+err);
      });
    }],
    link: function($scope, $element, $attrs, $ctrl) {
    }
  };
}]);
