/**********************************************************************

File     : background-video.js
Project  : N Simulator Library
Purpose  : Source file for a YouTube video background component.
Revisions: Original definition by Lawrence Gunn.
           2014/09/27

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('wr3dApp').directive('backgroundVideo', [function() {
  return {
    restrict: 'E',
    templateUrl: 'src/components/background-video/background-video.html',
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$interval', function (ComponentExtensions, $scope, $element, $attrs, $interval) {
      ComponentExtensions.initialize(this, 'backgroundVideo', $scope, $element, $attrs);

      $scope.videoId = $attrs.videoId;
      var minHeight = 900;
      $scope.resizeVideo = function() {
        $scope.videoWidth = $('body').width();
        $scope.videoHeight = Math.ceil(9/16*$scope.videoWidth);
        if($scope.videoHeight < minHeight) {
          $scope.videoHeight = minHeight;
          $scope.videoWidth = 16/9*minHeight;
        }
      }

      $scope.resize = function() {
        if($scope.videoWidth !== $('body').width()) {
          $scope.resizeVideo();
          if($element.find('.player').tubeplayer) {
            $element.css('height', ''+$scope.videoHeight+'px');
            $element.find('.player').tubeplayer('size', { width: $scope.videoWidth, height: $scope.videoHeight });
          }
        }
      };

      var resizeTimer = $interval($scope.resize, 1000);

      $scope.$on('$destroy', function() {
        if(!_.isUndefined(resizeTimer)) {
          $interval.cancel(resizeTimer);
          resizeTimer = undefined;
        }
      });
    }],

    link: function($scope, $element, $attrs, $ctrl) {

      $scope.resizeVideo();

      $element.find('.player').tubeplayer( {
        width: $scope.videoWidth, // the width of the player
        height: $scope.videoHeight, // the height of the player
        start: 1,
        autoPlay: true,
        showinfo: false,
        modestbranding: false,
        playbackRate: 1.0,
        loop:10,
        showControls: false,
        allowFullScreen: "false", // true by default, allow user to go full screen
        initialVideo: $scope.videoId, // "RgIxcrA7BfM" is water and drops - "oQTtZLtkVEc" are balls
        preferredQuality: "default",// preferred quality: default, small, medium, large, hd720
        onPlayerUnstarted: function() {
          console.log('a');
        },
        onError: function() {
          console.log('b');
        },
        onErrorNotFound: function() {
          console.log('c');
        },
        onErrorNotEmbeddable: function() {
          console.log('d');
        },
        onErrorInvalidParameter: function() {
          console.log('e');
        },
        onPlay: function() {
          console.log('f');
        },
        onPause: function() {
          console.log('g');
        }, // after the pause method is called
        onStop: function() {
          console.log('h');
        },
        onSeek: function(time){}, // after the video has been seeked to a defined point
        onMute: function(){}, // after the player is muted
        onUnMute: function(){} // after the player is unmuted
      });

      setTimeout(function() {
        $element.find('.player').tubeplayer('play');
      }, 4000);

      setTimeout(function() {
        $element.find('.player').tubeplayer('stop');
      }, 60000);

    }
  };
}]);
