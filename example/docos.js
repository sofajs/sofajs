var DocServer = require('../../docos/lib');  // will be npm package
var Hoek = require('hoek');
var Sofa = require('../lib');
var Composer = require('./sofafest');

var internals = {};

// create sofa project object

internals.Sofa = Sofa.init(Composer.manifest, Composer.composeOptions);

DocServer.init(internals.Sofa, Composer.manifest.docs.port, function (err, server) {

    Hoek.assert(!err, err);

    // Server connections
    var web = server.select('web');

    // Logging started server
    console.log('Docs Web server started at: ' + web.info.uri);
});

