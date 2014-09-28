/**
 * Created by lawrence.gunn on 9/25/14.
 */
'use strict';

Exam.QuickSort = function(helper) {
  var input = [ 3, 7, 8, 5, 2, 1, 9, 5, 4 ];
  var output = [];
  var isValid = false;
  var time = 0;

  var sort = function(ar) {
    var len = ar.length;
    if(len < 2) {
      return;
    }

    quicksort(ar, 0, len-1);
  };

  var quicksort = function(ar, left, right) {
    if(left < right) {
      var pivot = sortPartitian(ar, left, right);
      quicksort(ar, left, pivot-1);
      quicksort(ar, pivot+1, right);
    }
  };

  var sortPartitian = function(ar, left, right) {
    // Find a pivot.
    var pivot = selectPivot(left, right);
    var pivotValue = ar[pivot];

    // Put the pivot element off to the right.
    helper.swap(ar, right, pivot);


    var storeIndex = left;
    for(var i=left; i<right; i++) {
      if(ar[i] < pivotValue) {
        helper.swap(ar, i, storeIndex);
        storeIndex++;
      }
    }
    helper.swap(ar, storeIndex, right);
    return storeIndex;
  };

  var selectPivot = function(left, right) {
    return Math.floor(0.5*(left+right));
  };

  var runTest = function(size) {
    input = helper.generateRandomStrings(size);
    output = _.clone(input);
    var start = new Date();
    sort(output);
    var end = new Date();
    time = end.getTime()-start.getTime();
    isValid = helper.validateSort(output);
  };

  return {
    name: 'Quick Sort',
    runTest: runTest,
    getInput: function() { return input; },
    getOutput: function() { return output; },
    getTime: function() { return time; },
    getIsValid: function() { return isValid; }
  };
};