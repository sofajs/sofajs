var Joi = require('joi');
var Hoek = require('hoek');

var internals = {};
var sofaInternals = {};

exports = module.exports = internals.Composer = function (sofaInternalsParam) {

    internals.context = this;
    sofaInternals = sofaInternalsParam;

    this.identity = 'composer';

    this.compose = function (manifest, composeOptions) {

        console.log('composer executed' + sofaInternals.test);
    };

    return this;
};
