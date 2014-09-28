/**
 * Created by lawrence.gunn on 9/25/14.
 */
'use strict';

Exam.BubbleSort = function(helper) {
  var input = [];
  var output = [];
  var isValid = false;
  var time = 0;

  var sort = function(ar) {
    var len = ar.length;
    if(len < 2) {
      return;
    }
    var sorted;
    do {
      sorted = true;
      for(var i=0; i<len-1; i++) {
        if(ar[i] > ar[i+1]) {
          helper.swap(ar, i, i+1);
          sorted = false;
        }
      }
    } while(!sorted);
  };

  var runTest = function(size) {
    input = helper.generateRandomStrings(size);
    output = _.clone(input);
    var start = new Date();
    sort(output);
    var end = new Date();
    time = end.getTime()-start.getTime();
    isValid = helper.validateSort(output);
    console.log(time);
  };

  return {
    name: 'Bubble Sort',
    runTest: runTest,
    getInput: function() { return input; },
    getOutput: function() { return output; },
    getTime: function() { return time; },
    getIsValid: function() { return isValid; }
  };
};