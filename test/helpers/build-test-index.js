#! /usr/bin/env node

var childProcess = require('child_process');
var fs = require('fs');
var path = require('path');

var indexer = childProcess.spawn('node',
  [path.join(__dirname, '../../lib/jekyll_pages_api_search/search.js')]);

fs.createReadStream(path.join(__dirname, '../data/test-corpus.json'))
  .pipe(indexer.stdin);
indexer.stdout.pipe(
  fs.createWriteStream(path.join(__dirname, '../data/search-index.json')));
