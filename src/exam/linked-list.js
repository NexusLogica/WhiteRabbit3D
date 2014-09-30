/**
 * Created by lawrence.gunn on 2014/09/29.
 */
'use strict';

Exam.LinkedList = function(helper) {
  var input = [ 1, 2, 3, 4, 5, 6, 7, 8  ];
  var output = [];
  var front = null;
  var isValid = false;
  var time = 0;

  var assert = function(actual, expected, msg) {
    if(actual !== expected) {
      debugger;
    }
  };

  var Link = function(value) {
    this.value = value;
    this.next = null;
  };

  Link.prototype.append = function(link) {
    assert(this.next, null, 'Appending to middle');
    this.next = link;
  };

  var pushBack = function(val) {
    if(!front) {
      front = new Link(val);
    } else {
      var link = front;
      while(link.next !== null) {
        link = link.next;
      }
      link.append(new Link(val));
    }
  };

  var popLink = function() {
    var toReturn = front;
    if(front) {
      front = front.next;
    }
    return toReturn;
  };

  var pushLinkFront = function(link) {
    link.next = front;
    front = link;
  };

  var reverse = function() {
    if(!front) { return; }
    if(!front.next) { return; }

    var current = front;
    var link;
    while((link = popLink())) {
      link.next = current;
      current = link;
    }
    front = current;
  };

  var clear = function() {
    front = null;
  };

  var runTest = function(size) {
    // input = helper.generateRandomStrings(size);
    output = [];
    var start = new Date();
    _.forEach(input, function(val) {
      pushBack(val);
    });
    isValid = true;
    var link = front;
    var i;
    for(i=0; i<input.length; i++) {
      var inputVal = input[i];
      if(inputVal !== link.value) {
        assert(link.value, inputVal, 'append not working');
        isValid = false;
      }
      link = link.next;
    }

    debugger;
    var reversed = _.clone(input);
    reversed.reverse();
    reverse();
    link = front;
    for(i=0; i<reversed.length; i++) {
      var reversedVal = reversed[i];
      if(reversedVal !== link.value) {
        assert(link.value, reversedVal, 'reverse not working');
        isValid = false;
      }
      link = link.next;
    }

    var end = new Date();
    time = end.getTime()-start.getTime();
  };

  return {
    name: 'Linked List',
    runTest: runTest,
    getInput: function() { return input; },
    getOutput: function() { return output; },
    getTime: function() { return time; },
    getIsValid: function() { return isValid; }
  };
};