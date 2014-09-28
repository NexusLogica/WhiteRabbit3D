/**********************************************************************

File     : component-extensions.js
Project  : N Simulator Library
Purpose  : Source file for a standard header.
Revisions: Original definition by Lawrence Gunn.
           2014/08/12

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('wr3dApp').service('ComponentExtensions', [function() {

  /***
   * Initializes the component directive by performing standard setup tasks and adding extensions to the controller
   * @method initialize
   * @param _this
   * @param name
   * @param $scope
   * @param $attrs
   */
  var initialize = function(controller, name, $scope, $element, $attrs) {

    $scope.piComponentName = name;
    var camelName = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    $element.addClass(camelName);

    // Allow for more intelligent parent/child scope communications. Set the
    // piParentComponent for this scope.
    var parentScope = $scope.$parent;
    while (parentScope && !_.has(parentScope, 'piComponentName')) {
      parentScope = parentScope.$parent;
    }
    $scope.piParentComponent = parentScope;

    // If there is an expose-to-parent="someChild" attribute then set on the parent scope
    // the property accessed in the parent scope as $scope.someChild.
    if (!_.isEmpty($attrs.exposeToParent)) {
      parentScope[$attrs.exposeToParent] = $scope;
    }
  };

  var exposeForms = function($scope, $element, $attrs) {

  };

  // Service Object Definition
  var extensions = {
    initialize: initialize,
    exposeForms: exposeForms
  };

  return extensions;
}]);
