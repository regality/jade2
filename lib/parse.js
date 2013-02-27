"use strict";

var fs       = require('fs')
  , PEG      = require('pegjs')
  , pegData  = fs.readFileSync(__dirname + '/jade.peg').toString()
  , parsePEG = PEG.buildParser(pegData).parse
  ;

module.exports = parse;

function parse(str) {
  str = preParse(str);
  var tree = parsePEG(str);
  return tree;
}

function preParse(jade) {
  var lines = jade.toString().split('\n');
  var stack = [];

  function last() {
    return stack[stack.length - 1] || 0;
  }

  for (var i = 0; i < lines.length; ++i) {
    var line = lines[i];
    if (!line || line.match(/^\s+$/)) {
      lines.splice(i, 1);
      i -= 1;
      continue;
    }
    var indent = line.match(/^[ ]+/)
    if (!indent) continue;
    indent = indent[0];
    lines[i] = lines[i].replace(/^[ ]+/, '');
    if (indent.length == last()) continue;
    if (indent.length > last()) {
      lines.splice(i, 0, '{INDENT:' + indent.length + '}');
      i += 1;
      stack.push(indent.length);
    } else {
      while (indent.length < last()) {
        lines.splice(i, 0, '{DEDENT}');
        i += 1;
        stack.pop();
      }
    }
  }
  lines = lines.concat(stack.map(function() { return '{DEDENT}' }));
  return lines.join('\n');
}
