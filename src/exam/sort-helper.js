/**
 * Created by lawrence.gunn on 9/25/14.
 */
'use strict';

var Exam = Exam || {};

Exam.SortHelper = function() {
  var generateRandomStrings = function(num, seed) {
    var rand = new Random(seed);

    var ar = [];
    var ia = 'a'.charCodeAt(0);
    for(var i=0; i<num; i++) {
      var len = Math.ceil(rand.random()*6)+1;
      var str = '';
      for(var j=0; j<len; j++) {
        var n = Math.floor(rand.random()*26);
        str += String.fromCharCode(n+ia);
      }
      ar.push(str);
    }
    return ar;
  };

  var swap = function(ar, i, j) {
    var temp = ar[i];
    ar[i] = ar[j];
    ar[j] = temp;
  };

  var validateSort = function(ar) {
    for(var i=0; i<ar.length-1; i++) {
      if(ar[i] > ar[i+1]) {
        return false;
      }
    }
    return true;
  };

  return {
    generateRandomStrings: generateRandomStrings,
    swap: swap,
    validateSort: validateSort
  };
};