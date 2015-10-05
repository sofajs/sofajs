// docserver/index.js
// sofajs documentation server

var Glue = require('glue');
var Composer = require('./manifest');

exports.init = function (sofa, docsPort, next) {

    Composer.manifest.connections[0].port = docsPort;


    Glue.compose(Composer.manifest, Composer.composeOptions, function (err, server){

        if (err) {
            return next(err);
        }

        server.app.sofaDocs = sofa.docs;

        server.start(function (err) {

            return next(err, server);
        });
    });
};
