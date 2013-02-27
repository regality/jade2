var fs      = require('fs')
  , jade    = require('./lib/jade')
  , argv    = require('optimist').demand(1).argv
  , file    = argv._[0]
  ;

var options = {
  pretty: argv.pretty,
  __driver: argv.driver,
  title: 'zomga jade!',
  mix: [ 'purr', 'paw' ],
  ppl: {
    john: 'dead',
    bill: 'alive',
    joe: 'not dead yeat'
  }
};

var output = jade.renderFile(file, options);
process.stdout.write(output);
