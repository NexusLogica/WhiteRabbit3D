/**********************************************************************

File     : home.js
Project  : N Simulator Library
Purpose  : Source file for a home page component.
Revisions: Original definition by Lawrence Gunn.
           2014/09/27

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('wr3dApp').directive('home', [function() {
  return {
    restrict: 'E',
    templateUrl: 'src/components/home/home.html',
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$timeout', function (ComponentExtensions, $scope, $element, $attrs, $timeout) {
      ComponentExtensions.initialize(this, 'home', $scope, $element, $attrs);


    }],
    link: function($scope, $element, $attrs, $ctrl) {
      $scope.scrollToPi = function() {
        $('html, body').animate({
          //scrollTop: $(".about-pi").offset().top
        }, 1000);
      };

      var piParallax = function(initialOffset) {

        var activeRange = 2.25;
        var maxRotation = 30.0;

        var pi = $element.find('.about-pi');
        var piBox = pi.find('.box');
        var piBoxHeight = piBox.height();
        var offset = pi.offset();
        var height = pi.height();
        var middle = offset.top+0.5*height;
        var topMost = middle-0.5*activeRange*height;
        var bottomMost = middle+0.5*activeRange*height;

        var isActive = true; // Force initialization

        var update = function(ratio) {
          var r = maxRotation*(0.5*(1.0+Math.cos(2*Math.PI*ratio)));
          piBox.css('transform', 'rotateY('+r+'deg)');
        }

        var onScroll = function(pageMiddle) {
          if(pageMiddle > topMost && pageMiddle < bottomMost) {
            isActive = true;
            update((pageMiddle-topMost)/(bottomMost-topMost));
          } else if(isActive) {
            isActive = false;
            update(pageMiddle <= topMost ? 0.0 : 1.0);
          }
        };

        return {
          onScroll: onScroll
        };
      }();

/*
      var scrollAnimate = function(top) {
        var piTop = $('.about-pi').offset().top-triggerHeight;
        var piHeight = $('.about-pi').height()+triggerHeight;
        var y = top-piTop;
        if(top > piTop && y < piHeight) {
          boxIsHidden = false;
          var opacity = y/piHeight;
          var left = 100+100*y/piHeight;
          $('.about-pi .box').css('opacity', opacity);
          $('.about-pi .box').css('left', ''+left+'px');
        } else if(!boxIsHidden) {
          boxIsHidden = true;
          $('.about-pi .box').css('opacity', 0.0).css('left', '100px');
        }
      };
*/
      var parallaxEffects = [ piParallax ];

      var currentMiddle = -1;
      var timerId = setInterval(function() {

        var newTop = $(window).scrollTop();
        var height = $(window).height();
        var middle = newTop+0.5*height;
        if(middle !== currentMiddle) {
          currentMiddle = middle;
          _.forEach(parallaxEffects, function(effect) {
            effect.onScroll(currentMiddle);
          });
        }
      }, 20);

      $scope.$on('$destroy', function() {
        if(!_.isUndefined(timerId)) {
          clearInterval(timerId);
          timerId = undefined;
        }
      });
/*
      // Smooth scroll for in page links
      var setupScroll = function() {
        var target, scroll;

        $("a[href*=#]:not([href=#])").on("click", function(e) {
            if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
                target = $(this.hash);
                target = target.length ? target : $("[id=" + this.hash.slice(1) + "]");

                if (target.length) {
                    if (typeof document.body.style.transitionProperty === 'string') {
                        e.preventDefault();

                        var avail = $(document).height() - $(window).height();

                        scroll = target.offset().top;

                        if (scroll > avail) {
                            scroll = avail;
                        }

                        $("html").css({
                            "margin-top" : ( $(window).scrollTop() - scroll ) + "px",
                            "transition" : "1s ease-in-out"
                        }).data("transitioning", true);
                    } else {
                        $("html, body").animate({
                            scrollTop: scroll
                        }, 1000);
                        return;
                    }
                }
            }
        });

        $("html").on("transitionend webkitTransitionEnd msTransitionEnd oTransitionEnd", function (e) {
            if (e.target == e.currentTarget && $(this).data("transitioning") === true) {
                $(this).removeAttr("style").data("transitioning", false);
                $("html, body").scrollTop(scroll);
                return;
            }
        });
      }();
*/
    }
  };
}]);
