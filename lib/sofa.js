var Base = require('./base');
var Composer = require('./composer');
var Designs = require('./designs');
var Promises = require('./promises');
var Requests = require('./requests');
var Tools = require('./tools');
var Utils = require('./utils');

var Hoek = require('hoek');

var internals = {};

var sofaInternals = {};

exports = module.exports = internals.Sofa = function (manifest, composeOptions) {

    this.identity = 'sofajs';

    sofaInternals.manifest = manifest;

    sofaInternals.composeOptions = composeOptions;

    Utils.call(this, sofaInternals);

    sofaInternals.test = ' sofaInternals.test';

    Promises.call(this, sofaInternals);

    Tools.call(this, sofaInternals);

    Designs.call(this, sofaInternals);

    Base.call(this, sofaInternals);

    Requests.call(this, sofaInternals);

    Composer.call(this, sofaInternals);

    this.compose(manifest, composeOptions);

    // get clone of sofaInternals for testing

    this.getSofaInternals = function (callback) {

        // var clone = Hoek.clone(sofaInternals);

        return callback(null, sofaInternals);
    };

    // make requests available to public

    this.requests = sofaInternals.requests;

    // docs value for testing

    this.docs = sofaInternals.docs;

    return this;
};

