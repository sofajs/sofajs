var Composer = require('./composer');
var Promises = require('./promises');
var Tools = require('./tools');
var Designs = require('./designs');
var Hoek = require('hoek');

var internals = {};

var sofaInternals = {};

exports = module.exports = internals.Sofa = function (manifest, composeOptions) {

    this.identity = 'sofajs';

    sofaInternals.test = ' sofaInternals.test';

    Promises.call(this, sofaInternals);

    Tools.call(this, sofaInternals);

    Designs.call(this, sofaInternals);

    Composer.call(this, sofaInternals);

    this.compose(manifest, composeOptions);


    // get clone of sofaInternals for testing

    this.getSofaInternals = function () {

        var clone = Hoek.clone(sofaInternals);

        return clone;
    };


    return this;
};


