// ./lib/internals/foundation/core.js
// internal foundation functions to be included in all sofajs applications.

var Promise = require('bluebird');
var Hoek = require('hoek');
var Items = require('items');

var internals = {};
var sofaInternals = {};


exports = module.exports = internals.Core = function (sofaInternalsParam) {

    internals.context = this;
    sofaInternals = sofaInternalsParam;

    internals.foundationGroupName = 'core';

    sofaInternals.foundation.register(internals.foundationGroupName)
        .foundation.requests([

            // test

            {
                name: 'test',
                group: internals.foundationGroupName,
                comment: 'test foundation configuration  \n',
                handler: function (callback) {

                    // console.log('YES!! foundation test executed');
                    return callback(null, 'foundation executed');
                }
            }
        ]);

    return sofaInternals;
};
