/**
 * Created by lawrence.gunn on 9/25/14.
 */
'use strict';

Exam.MergeSort = function(helper) {
  //var input = [ 3, 7, 8, 5, 2, 1, 9, 5, 4 ];
  var input = [ 7, 8, 5, 3,    5, 9, 4, 1  ];
  var output = [];
  var isValid = false;
  var time = 0;

  var sort = function() {
    var len = input.length;
    if(len < 2) {
      return;
    }

    var ia, ib, sizeb;
    var size = 1;
    while(size <= len) {
      ia = 0;
      ib = ia+size;
      var offsetOutput = 0;
      for(var i=0; i<len; i += 2*size) {
        if(ib < len) {
          sizeb = size;
          if(ib+sizeb > len) {
            sizeb = len-ib;
          }
          merge(input, output, ia, ib, offsetOutput, size, sizeb);
          ia = ib+size;
          ib = ia+size;
          offsetOutput += size+sizeb;
        } else {
          // Copy ia to output.
          for(var j=ia; j<len; j++) {
            output[j] = input[j];
          }
        }
      }
      size *= 2;
      if(size <= len) {
        var temp = input;
        input = output;
        output = temp;
      }
    }
  };

  var merge = function(ar, out, offseta, offsetb, offsetOut, lena, lenb) {
    var num = lena+lenb;
    var ia = offseta, ib = offsetb, iOut = offsetOut;
    var enda = offseta+lena, endb = offsetb+lenb;
    for(var i=0; i<num; i++) {
      if(ia >= enda) {
        out[iOut] = ar[ib];
        ib++;
      } else if(ib >= endb || ar[ia] < ar[ib]) {
        out[iOut] = ar[ia];
        ia++;
      } else {
        out[iOut] = ar[ib];
        ib++;
      }
      iOut++;
    }
  };


  var runTest = function(size) {
    input = helper.generateRandomStrings(size);
    output = [];
    var start = new Date();
    sort();
    var end = new Date();
    console.log(output);
    time = end.getTime()-start.getTime();
    isValid = helper.validateSort(output);
  };

  return {
    name: 'Merge Sort',
    runTest: runTest,
    getInput: function() { return input; },
    getOutput: function() { return output; },
    getTime: function() { return time; },
    getIsValid: function() { return isValid; }
  };
};