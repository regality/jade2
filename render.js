var fs      = require('fs')
  , jade    = require('./lib/jade')
  , file    = process.argv[2]
  ;

var options = {
  pretty: process.argv.indexOf('--pretty') !== -1,
  title: 'zomga jade!'
};
var html = jade.renderFile(process.argv[2], options);
process.stdout.write(html);
