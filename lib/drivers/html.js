var doctypes = require('../doctypes')
  , node     = require('../node')
  , has      = node.has
  , get      = node.get
  , getEach  = node.getEach
  , getAll   = node.getAll
  ;

module.exports = renderTreeHtml;

function renderTreeHtml(tree, options, buf) {
  buf = buf || [];
  tree.forEach(function(node) {
    renderNodeHtml(node, tree, options, buf);
  });
  var html = buf.join('');
  return html
}

function renderNodeHtml(node, tree, options, buf) {

  get('each', node, function(iterator) {
    var collection = options[iterator.collection];
    var key = iterator.key || '__i';
    var value = iterator.value;
    for (var i in collection) {
      options[value] = collection[i];
      options[key] = i;
      getEach('children', node, function(children) {
        renderTreeHtml(children, options, buf);
      });
    }
  });
  if (has('each', node)) return;

  get('doctype', node, function(type) {
    if (doctypes[type]) {
      buf.push(doctypes[type]);
    } else {
      buf.push(doctypes['default']);
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
    getEach('id', node, function(id) {
      buf.push(' id="' + id + '"')
    });
    getAll('class', node, function(classes) {
      buf.push(' class="' + classes.join(' ') + '"')
    });
    getEach('attr', node, function(attr) {
      buf.push(' ' + attr.name + '="' + attr.value + '"');
    });
    buf.push('>')
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
  get('variable', node, function(variable) {
    if (options.pretty) {
      get('indent', node, function(spaces) {
        buf.push(new Array(spaces + 1).join(' '));
      });
      get('tag', node, function(tag) {
        buf.push('  ');
      });
    }
    buf.push(options[variable]);
    buf.push('\n');
  });

  // children nodes
  getEach('children', node, function(children) {
    renderTreeHtml(children, options, buf);
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

