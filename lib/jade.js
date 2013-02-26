"use strict";

var fs       = require('fs')
  , PEG      = require('pegjs')
  , doctypes = require('./doctypes')
  , pegData  = fs.readFileSync(__dirname + '/jade.peg').toString()
  , parsePEG = PEG.buildParser(pegData).parse
  ;

module.exports = {
  renderString: renderString,
  renderFile: renderFile,
  renderTree: renderTree,
  renderNode: renderNode,
  preParse: preParse,
  parse: parse
};

function renderFile(filename, options) {
  var jade = fs.readFileSync(filename).toString();
  return renderString(jade, options);
}

function renderString(jade, options) {
  var tree = parse(jade)
    , html = renderTree(tree, options);
    ;

  return html;
}

function renderTree(tree, options, buf) {
  buf = buf || [];
  tree.forEach(function(node) {
    renderNode(node, tree, options, buf);
  });
  var html = buf.join('');
  return html
}

function renderNode(node, tree, options, buf) {

  get('doctype', node, function(type) {
    if (doctypes[type]) {
      buf.push(doctypes[type]);
    }
    if (options.pretty) {
      buf.push('\n');
    }
  });

  // open tag
  get('tag', node, function(tag) {
    if (options.pretty) {
      get('indent', node, function(spaces) {
        buf.push(new Array(spaces + 1).join(' '));
      });
    }
    buf.push('<' + tag);
  });
  getEach('id', node, function(id) {
    buf.push(' id="' + id + '"')
  });
  getAll('class', node, function(classes) {
    buf.push(' class="' + classes.join(' ') + '"')
  });
  getEach('attr', node, function(attr) {
    buf.push(' ' + attr.name + '="' + attr.value + '"');
  });
  get('tag', node, function(tag) {
    buf.push('>')
  });
  get('tag', node, function(tag) {
    if (options.pretty) {
      buf.push('\n');
    }
  });

  // text content
  get('text', node, function(text) {
    if (options.pretty) {
      get('indent', node, function(spaces) {
        buf.push(new Array(spaces + 1).join(' '));
      });
      get('tag', node, function(tag) {
        buf.push('  ');
      });
    }
    buf.push(text)
    buf.push('\n');
  });

  // children nodes
  getEach('children', node, function(children) {
    renderTree(children, options, buf);
  });

  // closing tag
  get('tag', node, function(tag) {
    if (options.pretty) {
      get('indent', node, function(spaces) {
        buf.push(new Array(spaces + 1).join(' '));
      });
    }
    buf.push('</' + tag + '>')
    if (options.pretty) {
      buf.push('\n');
    }
  });
}

function get(what, node, fn) {
  for (var i = 0; i < node.length; ++i) {
    if (node[i].what === what) return fn(node[i].value);
  }
}

function getAll(what, node, fn) {
  var all = node.filter(function(v) {
    return v.what === what;
  });
  if (all.length) fn(all.map(function(v) { return v.value }));
}

function getEach(what, node, fn) {
  var all = node.filter(function(v) {
    return v.what === what;
  });
  all.map(function(v) { return v.value }).forEach(fn);
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

function parse(str) {
  str = preParse(str);
  var tree = parsePEG(str);
  return tree;
}
