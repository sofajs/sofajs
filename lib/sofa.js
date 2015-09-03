var Composer = require('./composer');
var Promises = require('./promises');
var Tools = require('./tools');
var Utils = require('./utils');
var Designs = require('./designs');
var Requests = require('./requests');
var Hoek = require('hoek');

var internals = {};

var sofaInternals = {};

exports = module.exports = internals.Sofa = function (manifest, composeOptions) {

    this.identity = 'sofajs';

    sofaInternals.test = ' sofaInternals.test';

    Promises.call(this, sofaInternals);

    Tools.call(this, sofaInternals);

    Designs.call(this, sofaInternals);

    Utils.call(this, sofaInternals);

    Requests.call(this, sofaInternals);

    Composer.call(this, sofaInternals);

    this.compose(manifest, composeOptions);

    // get clone of sofaInternals for testing

    this.getSofaInternals = function () {

        var clone = Hoek.clone(sofaInternals);

        return clone;
    };

    // make requests available to public

    this.requests = sofaInternals.requests;

    // docs value for testing

    this.docs = sofaInternals.docs;

    return this;
};


