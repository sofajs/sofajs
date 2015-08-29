
var Sofa = require('./sofa');

// Declare internals

var internals = {};


var manifest = 'manifest.';
var composeOptions = 'options.file';

exports.init = function (manifest, composeOptions) {

    return new Sofa(manifest, composeOptions);
};
