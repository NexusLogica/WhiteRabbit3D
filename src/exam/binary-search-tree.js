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

  var assert = function(actual, expected, msg) {
    if(actual !== expected) {
//      debugger;
    }
  };

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

  Node.prototype.findParent = function(key) {
    var foundNode = null;
    if(this.right) {
      if(this.right.key === key) {
        return this;
      }
      foundNode = this.right.findParent(key);
    }
    if(!foundNode && this.left) {
      if(this.left.key === key) {
        return this;
      }
      foundNode = this.left.findParent(key);
    }
    return foundNode;
  };

  Node.prototype.deleteChild = function(childSide) {
    var child = this[childSide];

    // Easy, just delete the node.
    if(!child.left && !child.right) {
      this[childSide] = null;
    } else if(child.left && child.right) {
      // The hard case.
      var replaceSide = Math.random() > 0.5 ? 'left' : 'right';
      var replaceNode = child[replaceSide];
      if(replaceNode.left && replaceNode.right) {
        var replacedChildSide = Math.random() > 0.5 ? 'left' : 'right';
        replaceNode.deleteChild(replacedChildSide);
      }
      this[childSide] = replaceNode;
    } else if(child.left) {
      // Left only
      parent[childSide] = child.left;
    } else {
      // Right only.
      parent[childSide] = child.right;
    }
  };

  var insert = function(key, value) {
    if(!root) {
      root = new Node(key, value);
    } else {
      root.insert(new Node(key, value));
    }
  };

  var deleteNode = function(key) {
    if(!root) {
      return false;
    } else if(root.key === key) {
      root = null;
    } else {
      var parent = root.findParent(key);

      if(parent) {
        // Found the child.
        var childSide = (parent.left && parent.left.key === key ? 'left' : 'right');
        parent.deleteChild(childSide);
        return true;
      }
    }
    return false;
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
    var input = helper.generateRandomStrings(size, 42);
    console.log('Binary tree strings are...');
    console.log(input);
    var start = new Date();
    _.forEach(input, function(str) {
      insert(str, str.toUpperCase());
      if(!isValid(root)) {
        debugger;
      }
    });

    insert('blahblah', 'blahblah'.toUpperCase());

    _.shuffle(input);
    console.log('Schuffled tree is...');
    console.log(input);

    _.forEach(input, function(str) {
      var node = find(str);
      if(!node) {
        debugger;
      }
      if(node.value.toUpperCase() !== str.toUpperCase()) {
        debugger;
      }
    });

    var deleted = deleteNode('blahblah');
    assert(deleted, true, 'Deleted blahblah');
    var found = find('blahblah');
    assert(found, null, 'Not found');

    _.forEach(input, function(key) {
      if(key !== root.key) {
        console.log('Deleting '+key);
        var deleted = deleteNode(key);
        assert(deleted, true, 'Deleted '+key);
        var found = find(key);
        assert(found, null, 'Key '+key+' found');
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