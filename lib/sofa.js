var Composer = require('./composer');
var Hoek = require('hoek');

var internals = {};

var sofaInternals = {};

exports = module.exports = internals.Sofa = function (manifest, composeOptions) {

    this.identity = 'sofajs';

    sofaInternals.test = ' sofaInternals.test';

    Composer.call(this, sofaInternals);

    this.compose();

    return this;
};


