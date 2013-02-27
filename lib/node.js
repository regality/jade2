exports.has = function get(what, node) {
  return node.some(function(v) {
    return v.what === what;
  });
}

exports.get = function get(what, node, fn) {
  for (var i = 0; i < node.length; ++i) {
    if (node[i].what === what) return fn(node[i].value);
  }
}

exports.getAll = function getAll(what, node, fn) {
  var all = node.filter(function(v) {
    return v.what === what;
  });
  if (all.length) fn(all.map(function(v) { return v.value }));
}

exports.getEach = function getEach(what, node, fn) {
  var all = node.filter(function(v) {
    return v.what === what;
  });
  all.map(function(v) { return v.value }).forEach(fn);
}

