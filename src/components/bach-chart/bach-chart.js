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
      $scope.plotData = [];

      var processData = function() {
        $scope.dependentState = [];
        $scope.dependentAdditional = [];
        _.forEach($scope.data.state.dependent, function(dep) {
          $scope.dependentState.push({ name: dep.name, units: dep.units, active: false });
        });
        _.forEach($scope.data.additional.dependent, function(dep) {
          $scope.dependentAdditional.push({ name: dep.name, units: dep.units, active: false });
        });
      };

      var processPlotData = function() {
        $scope.plotData = [];
        $scope.plotLabels = [ $scope.data.state.independent.name ];
        $scope.series = {};

        var times = $scope.data.state.independent.values;
        for(var i=0; i<times.length; i++) {
          $scope.plotData.push([ times[i] ]);
        }

        var numSeries = 0;

        _.forEach($scope.data.state.dependent, function (dep) {
          var found = _.find($scope.dependentState, function (d) {
            return (d.name === dep.name);
          });
          if(found.active) {

            var data = dep.values;
            for (var i = 0; i < data.length; i++) {
              $scope.plotData[i].push(data[i]);
            }
            $scope.plotLabels.push(dep.name);
            $scope.series[dep.name] = { xplotter: smoothPlotter, axis: (numSeries > 0 ? "y2" : "y1") };
            numSeries++;
          }
        });

        _.forEach($scope.data.additional.dependent, function (dep) {
          var found = _.find($scope.dependentAdditional, function (d) {
            return (d.name === dep.name);
          });
          if(found.active) {

            var data = dep.values;
            for (var i = 0; i < data.length; i++) {
              $scope.plotData[i].push(data[i]);
            }
            $scope.plotLabels.push(dep.name);
            $scope.series[dep.name] = { xplotter: smoothPlotter, axis: (numSeries > 0 ? "y2" : "y1") };
            numSeries++;
          }
        });
      };

      $scope.$watch('data', function(newVal, oldVal) {
        if (newVal) {
          processData();
        }
      });

      $scope.onItemClick = function(item) {
        item.active = !item.active;
        $scope.plot();
      };

      $scope.plot = function() {
        processPlotData();

        $scope.chart = new Dygraph(
          $('div.plot').get(0),
          $scope.plotData,
          {
            labels: $scope.plotLabels,
            series: $scope.series,
            showRoller: false,
            labelsDivStyles: { "backgroundColor": "#e5e5e5" }
          });

        /**** uvChart
        var graphdef = { categories: [], dataset: {} };

        for(var i=0; i<$scope.plotData.length; i++) {
          var item = $scope.plotData[i];
          if(item.active) {
            graphdef.categories.push(item.name);
            graphdef.dataset[item.name] = item.data;
          }
        }

        var configuration = {
          meta: {
            position: "div.plot"
          }
        };

        if($scope.chart) {
          $('#uv-'+$scope.chart.id).remove();
        }
        $scope.chart = uv.chart('Line', graphdef, configuration);
debugger;
 *****/
        /*
        var data = {
          un: "LawrenceGunn",
          key: "5dqpclk0mw",
          origin: "plot",
          platform: "javascript",
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
*/
      };

    }],
    link: function($scope, $element, $attrs, $ctrl) {
//      $scope.plot();
    }
  };
}]);
