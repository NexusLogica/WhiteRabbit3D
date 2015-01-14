/**********************************************************************

File     : wr3d-extensions.js
Project  : N Simulator Library
Purpose  : Source file for a standard header.
Revisions: Original definition by Lawrence Gunn.
           2014/08/12

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

Ngl.nextWrChildId = 1;

angular.module('wr3dApp').service('Wr3dExtension', ['$parse', function($parse) {

  /***
   * Initializes the component directive by performing standard setup tasks and adding extensions to the controller
   * @method initialize
   * @param _this
   * @param name
   * @param $scope
   * @param $attrs
   */
  var initialize = function(controller, name, $scope, $element, $attrs) {

    $scope.wr3d = { wr3dComponentName: name };

    var camelName = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    $element.addClass(camelName);

    $scope.notifyScene = function() {
      if ($scope.wr3d.display) {
        $scope.$emit('wr3d:notify-scene', $scope);
      }
    };

    $scope.wr3d.display = true;
    if($attrs.hasOwnProperty('wrDisplay')) {
      var template = $parse($attrs.wrDisplay);
      var value = template($scope);
      if(!value) {
        $scope.wr3d.display = false;
        $element.css({ display: 'none' });
        return;
      }
    }

    $scope.wrChildId = Ngl.nextWrChildId;
    Ngl.nextWrChildId++;

    getStyleSelectors($scope, $element, $attrs);

    // Set some data on the element so that it can be found by traversing the DOM. Using scopes does not work because
    // the scopes are isolated so not easily found.
    $element.data('wr3d', $scope);

    $scope.$on('wr3d-scene:get-styles', function(event, hostContainer) {
      onGetStyles(hostContainer, $scope, $element, $attrs);
    });

  };

  var onGetStyles = function(hostContainer, $scope, $element, $attrs) {
    $scope.wrStyle = {};
    _.forEach($scope.wr3d.styleSelectors, function (id) {
      var style = hostContainer.getStyle(id);
      $scope.wrStyle = _.merge($scope.wrStyle, style);
    });

    if($scope.wr3d.wr3dComponentName === 'wr3dObject') {
      var objectType = $scope.wrStyle['object3d'];
      if(objectType && !_.isEmpty(objectType.type)) {
        switch (objectType.type) {
          case 'cube':
          case 'cuboid':
          {
            $scope.wr3d.wrObject = new Ngl.Cuboid($scope.wrStyle);
          }
        }
      }
    } else if($scope.wr3d.wr3dComponentName === 'wr3dDock') {
      $scope.wr3d.wrObject = new Ngl.WrDock($scope.wrStyle);
    } else if($scope.wr3d.wr3dComponentName === 'wr3dPanel') {
      $scope.canvas = new Ngl.HtmlCanvas($element, $scope.wrStyle);
      $scope.wr3d.wrObject = new Ngl.WrPanel($scope.canvas, $scope.wrStyle);
    }

    if($scope.wr3d.wrObject) {

      if($attrs.wrId) {
        $scope.wr3d.wrObject.id = $attrs.wrId;
      }

      // Find the parent object. If there is none specified in the style info then place attach it to their parent. If
      // the parent is the scene then dock it to the scene.
      if(!$scope.wrStyle.hasOwnProperty('parent3d')) {
        var parent = getParentWrScope($element);
        if(parent.wr3d) {
          if(parent.wr3d.scene) {
            $scope.wr3d.wrObject.config['parent3d'] = 'screen 1.00 center';
          }
          else if(parent.wr3d.wrObject) {
            $scope.wr3d.wrObject.config['parent3d'] = parent.wr3d.wrObject.id;
          }
        }
      }

      $scope.wr3d.wrObject.initialize(hostContainer.wr3d.scene.gl, hostContainer.wr3d.scene);
    }

  };

  var getStyleSelectors = function($scope, $element, $attrs) {
    var className = $attrs.wrClass;
    if (className) {
      $scope.wr3d.styleSelectors = className.split(' ').reverse();
    }
  };

  var getParentWrScope = function($element) {
    var elem = $element;
    while(true) {
      if(elem.parent().length === 0) {
        return undefined;
      }
      if(elem.parent().data('wr3d')) {
        var parentScope = elem.parent().data('wr3d');
        return parentScope;
      }
      elem = elem.parent();
    }
  };

  // Service Object Definition
  var extensions = {
    initialize: initialize
  };

  return extensions;
}]);
