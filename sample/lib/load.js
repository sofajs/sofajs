var Sofa = require('../../../sofajs/lib');
// var Sofa = require('sofajs');
var Compose = require('./sofafest');

var internals = {};
var database = {};

database = Sofa.init(Compose.manifest, Compose.composeOptions);

database.load(function (err, response) {

    if (err) {
        console.log('load error: ' + err);
        return;
    }

    console.log('load result: ' + response);
    return;
});

