var Sofa = require('../lib');
var Compose = require('./sofafest');
var Hoek = require('hoek');

var internals = {};

console.log('entered');
internals.DB = Sofa.init(Compose.manifest, Compose.composeOptions);

var sofaInternalsclone = internals.DB.getSofaInternals();

sofaInternalsclone.tools.core.test({ test: 'param sent' });

console.log('here' + JSON.stringify(sofaInternalsclone.docs.tools.core.test));

