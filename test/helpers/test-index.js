'use strict';

var lunr = require('lunr');
var temp = require('temp');
var fs = require('fs');
var path = require('path');

module.exports = TestIndex;

function TestIndex(filePath, indexingFunction) {
  this.filePath = filePath;
  this.index = lunr(indexingFunction || function() {
    this.ref('url');
    this.field('url', 10);
    this.field('title', 10);
    this.field('body', 0);
  });
  this.urlToDoc = {};
}

TestIndex.prototype.setup = function() {
  var testIndex = this;

  return new Promise(function(resolve, reject) {
    temp.mkdir('test-index', function(err, dirPath) {
      if (err) {
        return reject(err);
      }
      testIndex.basePath = dirPath;
      resolve(dirPath);
    });
  });
};

TestIndex.prototype.addDoc = function(doc) {
  var missingFields = [];

  missingFields = ['url', 'title', 'body'].filter(function(requiredField) {
    return !doc[requiredField];
  });
  if (missingFields.length !== 0) {
    throw new Error('doc is missing required fields: ' +
      missingFields.join('; '));
  }
  this.index.add(doc);
  this.urlToDoc[doc.url] = { url: doc.url, title: doc.title };
};

TestIndex.prototype.indexPath = function() {
  return this.path = this.path || path.join(this.basePath, this.filePath);
};

TestIndex.prototype.writeIndexFile = function() {
  var parentDirs = path.dirname(this.filePath).split(path.sep),
      currentDir = this.basePath,
      chain = Promise.resolve(),
      testIndex = this;

  parentDirs = parentDirs.filter(function(parentDir) {
    return parentDir !== '';
  });
  parentDirs.forEach(function(parentDir) {
    chain.then(function() {
      currentDir = path.join(currentDir, parentDir);
      return promisify('mkdir', currentDir);
    });
  });

  return chain.then(function() {
    return new Promise(function(resolve, reject) {
      var index = JSON.stringify({
        index: testIndex.index.toJSON(),
        urlToDoc: testIndex.urlToDoc
      });

      fs.writeFile(testIndex.indexPath(), index, 'utf8', function(err) {
        err ? reject(err) : resolve();
      });
    });
  });
};

TestIndex.prototype.teardown = function() {
  var chain = promisify('unlink', this.indexPath()),
      currentDir = path.dirname(this.indexPath());

  for (; currentDir !== this.basePath; currentDir = path.dirname(currentDir)) {
    chain.then(function() {
      return promisify('rmdir', currentDir);
    });
  }
  return chain;
};

function promisify(operation, dirOrFilePath) {
  return new Promise(function(resolve, reject) {
    fs[operation](dirOrFilePath, function(err) {
      err ? reject(err) : resolve();
    });
  });
}
