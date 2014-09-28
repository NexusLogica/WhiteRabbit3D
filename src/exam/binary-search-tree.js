/**
 * Created by lawrence.gunn on 9/25/14.
 *
 * Left is lower, right is higher key value.
 */
'use strict';

Exam.BinarySearchTree = function() {
  var root = null;
  var treeIsValid = false;
  var time = 0;

  var Node = function(key, value) {
    this.key = key;
    this.value = value;
    this.left = this.right = null;
  };

  Node.prototype.insert = function(node) {
    if(node.key > this.key) {
      if(this.right) {
        this.right.insert(node);
      } else {
        this.right = node;
      }
    } else {
      if(this.left) {
        this.left.insert(node);
      } else {
        this.left = node;
      }
    }
  };

  Node.prototype.find = function(key) {
    if(key === this.key) {
      return this;
    }
    if(key > this.key) {
      if(this.right) {
        return this.right.find(key);
      }
    } else {
      if(this.left) {
        return this.left.find(key);
      }
    }
    return null;
  };

  var insert = function(key, value) {
    if(!root) {
      root = new Node(key, value);
    } else {
      root.insert(new Node(key, value));
    }
  };

  var isValid = function(node) {
    if(node.left) {
      if(node.left.key > node.key) {
        debugger;
        return false;
      }
      if(!isValid(node.left)) {
        debugger;
        return false;
      }
    }
    if(node.right) {
      if(node.right.key < node.key) {
        debugger;
        return false;
      }
      if(!isValid(node.right)) {
        debugger;
        return false;
      }
    }
    return true;
  };

  var find = function(key) {
    if(root) {
      return root.find(key);
    }
    return null;
  };

  var runTest = function(size) {
    var input = helper.generateRandomStrings(size);
    var start = new Date();
    _.forEach(input, function(str) {
      insert(str, str.toUpperCase());
      if(!isValid(root)) {
        debugger;
      }
    });

    insert('blahblah', 'blahblah'.toUpperCase());

    _.shuffle(input);

    _.forEach(input, function(str) {
      var node = find(str);
      if(!node) {
        debugger;
      }
      if(node.value.toUpperCase() !== str.toUpperCase()) {
        debugger;
      }
    });
    var end = new Date();
    time = end.getTime()-start.getTime();
    treeIsValid = isValid(root);
    console.log(time);
  };

  return {
    name: 'Binary Search Tree',
    runTest: runTest,
    getTime: function() { return time; },
    getIsValid: function() { return treeIsValid; }
  };
};