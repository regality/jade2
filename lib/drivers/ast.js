module.exports = renderTreeAst;

function renderTreeAst(tree, options, buf) {
  if (options.pretty) {
    return JSON.stringify(tree, true, 2);
  } else {
    return JSON.stringify(tree);
  }
}
