var Promise = require('bluebird');
var Hoek = require('hoek');

var internals = {};
var sofaInternals = {};

exports = module.exports = internals.userDesign = function (sofaInternalsParam) {

    sofaInternals = sofaInternalsParam;
    internals.designGroup = 'user';

    sofaInternals.design.register(internals.designGroup)
        .design.views([])
        .design.updates([])
        .design.fixtures(['array of fixture docs']);

    return this;
};
