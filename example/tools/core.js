var Promise = require('bluebird');
var Hoek = require('hoek');

var internals = {};

var sofaInternals = {};

exports = module.exports = internals.Tools = function (sofaInternalsParam) {

    // Hoek.assert(this.identity === 'composer', ' must be instantiated using composer()');
    sofaInternals = sofaInternalsParam;

    internals.toolGroup = 'core';

    sofaInternals.tool.register(internals.toolGroup)
        .tooldocs(internals.toolGroup,
                'maintains core requests when working with couchdb.')
        .tools([

            // test

            {
                name: 'test',
                group: internals.toolGroup,
                comment: 'sofajs test tool object',
                handler: function (param, callback) {

                    internals.context = this;

                    // console.log('test tool object executed. ' + JSON.stringify(param) );

                    return callback(null, 'hey!!! tools.core.test callback ran');
                }
            }
        ]);

    return sofaInternals;
};
