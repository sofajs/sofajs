var Base = require('./base');
var Composer = require('./composer');
var Designs = require('./designs');
var Foundation = require('./foundation');
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

    Base.call(this, sofaInternals);

    Composer.call(this, sofaInternals);

    Designs.call(this, sofaInternals);

    Foundation.call(this, sofaInternals);

    Promises.call(this, sofaInternals);

    Requests.call(this, sofaInternals);

    Tools.call(this, sofaInternals);

    Utils.call(this, sofaInternals);

    this.compose(manifest, composeOptions);

    // get clone of sofaInternals for testing

    this.getSofaInternals = function (callback) {

        // var clone = Hoek.clone(sofaInternals);

        return callback(null, sofaInternals);
    };

    // expose requests to the world

    this.requests = sofaInternals.requests;

    // expose foundation to the world

    this.foundation = sofaInternals.foundation;

    // docs value for testing

    this.docs = sofaInternals.docs;

    return this;
};

