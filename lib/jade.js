"use strict";

var fs       = require('fs')
  , parse    = require('./parse')
  , drivers = {
      html: require('./drivers/html'),
      ast: require('./drivers/ast'),
      js: require('./drivers/js')
    }
  ;

module.exports = {
  renderString: renderString,
  renderFile: renderFile,
  renderTree: renderTree
};

function renderFile(filename, options) {
  var jadeStr = fs.readFileSync(filename).toString();
  return renderString(jadeStr, options);
}

function renderString(jadeStr, options) {
  var tree = parse(jadeStr);
  var html = renderTree(tree, options);
  return html;
}

function renderTree(tree, options, buf) {
  return drivers[options.__driver || 'html'](tree, options, buf);
}

