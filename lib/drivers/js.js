var doctypes = require('../doctypes')
  , node     = require('../node')
  , has      = node.has
  , get      = node.get
  , getEach  = node.getEach
  , getAll   = node.getAll
  , jstr     = JSON.stringify
  ;

module.exports = renderTreeJs;

function renderTreeJs(tree, options, buf) {
  var top = false
  if (!buf) top = true;
  buf = buf || [];

  if (top) {
    buf.push('(function() {');
    buf.push('return function(options) {');
    buf.push('var buf = [];');
  }
  tree.forEach(function(node) {
    renderNodeJs(node, tree, options, buf);
  });
  if (top) {
    buf.push('return buf.join("");');
    buf.push('};');
    buf.push('})()');
  }
  var js = buf.join('\n');
  return js;
}

function renderNodeJs(node, tree, options, buf) {

  get('each', node, function(iterator) {
    var collection = 'options[' + jstr(iterator.collection) + ']';
    var key = 'options[' + jstr(iterator.key || '__i') + ']';
    var value = 'options[' + jstr(iterator.value) + ']';
    buf.push('for (var i in ' + collection + ') {');
      buf.push(value + ' = ' + collection + '[i];');
      buf.push(key + ' = i;');
      getEach('children', node, function(children) {
        renderTreeJs(children, options, buf);
      });
    buf.push('}');
  });
  if (has('each', node)) return;

  get('doctype', node, function(type) {
    if (doctypes[type]) {
      buf.push('buf.push(' + jstr(doctypes[type]) + ');');
    }
    if (options.pretty) {
      buf.push("buf.push('\\n');");
    }
  });

  // open tag
  get('tag', node, function(tag) {
    if (options.pretty) {
      get('indent', node, function(spaces) {
        buf.push('buf.push("' +  new Array(spaces + 1).join(' ') + '");');
      });
    }
    buf.push('buf.push("<' + tag + '")');
  });
  getEach('id', node, function(id) {
    buf.push('buf.push(\' id=\"' + id + '"\');');
  });
  getAll('class', node, function(classes) {
    buf.push('buf.push(\' class=\"' + classes.join(' ') + '"\');');
  });
  getEach('attr', node, function(attr) {
    buf.push('buf.push(\' ' + attr.name + '="' + attr.value + '\"\');');
  });
  get('tag', node, function(tag) {
    buf.push("buf.push('>');");
  });
  get('tag', node, function(tag) {
    if (options.pretty) {
      buf.push("buf.push('\\n');");
    }
  });

  // text content
  get('text', node, function(text) {
    if (options.pretty) {
      get('indent', node, function(spaces) {
        buf.push("buf.push('" + new Array(spaces + 1).join(' ') + "');");
      });
      get('tag', node, function(tag) {
        buf.push("buf.push('  ');");
      });
    }
    buf.push("buf.push(" + jstr(text) + ");");
    buf.push("buf.push('\\n');");
  });
  get('variable', node, function(variable) {
    if (options.pretty) {
      get('indent', node, function(spaces) {
        buf.push("buf.push('" + new Array(spaces + 1).join(' ') + "');");
      });
      get('tag', node, function(tag) {
        buf.push("buf.push('  ');");
      });
    }
    buf.push("buf.push(options[" + jstr(variable) + "]);");
    buf.push("buf.push('\\n');");
  });

  // children nodes
  getEach('children', node, function(children) {
    renderTreeJs(children, options, buf);
  });

  // closing tag
  get('tag', node, function(tag) {
    if (options.pretty) {
      get('indent', node, function(spaces) {
        buf.push("buf.push('" + new Array(spaces + 1).join(' ') + "');");
      });
    }
    buf.push("buf.push('</" + tag + ">');");
    if (options.pretty) {
      buf.push("buf.push('\\n');");
    }
  });
}

