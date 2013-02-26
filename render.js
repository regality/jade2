var fs      = require('fs')
  , jade    = require('./lib/jade')
  , file    = process.argv[2]
  , options = { pretty: true }
  ;

var html = jade.renderFile(process.argv[2], options);
process.stdout.write(html);
