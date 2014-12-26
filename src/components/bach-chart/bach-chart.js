/**********************************************************************

File     : bach-chart.js
Project  : N Simulator Library
Purpose  : Source file for a bach chart component.
Revisions: Original definition by Lawrence Gunn.
           2014/12/12

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('wr3dApp').directive('bachChart', [function() {
  return {
    restrict: 'E',
    scope: {
      data: '=simulationData'
    },
    templateUrl: 'src/components/bach-chart/bach-chart.html',
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$http', function (ComponentExtensions, $scope, $element, $attrs, $http) {
      ComponentExtensions.initialize(this, 'bachChart', $scope, $element, $attrs);

      $scope.showStatus = false;

      $scope.$watch('data', function(newVal, oldVal) {
        if (newVal) {
          $scope.plot();
        }
      });

      $scope.plot = function() {
        var data = {
          un: "LawrenceGunn",
          key: "5dqpclk0mw",
          origin: "plot",
          platform: "lisp",
          args: JSON.stringify([[0, 1, 2], [3, 4, 5], [1, 2, 3], [6, 6, 5]]),
          kwargs: JSON.stringify({
            "filename": "plot from api",
            "fileopt": "overwrite",
            "style": {
              "type": "bar"
            },
            "traces": [1],
            "layout": {
              "title": "experimental data"
            },
            "world_readable": true
          })
        };

        $http.post(
          'https://plot.ly/clientresp',
          data,
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
            transformRequest: function(data){
              return $.param(data);
            }
          }).success(function(data) {
          console.log(data);
            $element.find('.plot').append('<iframe class="plot-iframe" src="'+data.url+'"></iframe>');
        }).error(function(err) {
          console.log('ERROR: '+err)

        });
      };

    }],
    link: function($scope, $element, $attrs, $ctrl) {
//      $scope.plot();
    }
  };
}]);
