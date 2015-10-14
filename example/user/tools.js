var Promise = require('bluebird');
var Hoek = require('hoek');

var internals = {};

var sofaInternals = {};

exports = module.exports = function (sofaInternalsParam) {

    sofaInternals = sofaInternalsParam;

    internals.toolGroup = 'user';

    sofaInternals.tool.register(internals.toolGroup)
        .tooldocs(internals.toolGroup,
                'helpers for working with user data')
        .tools([

            // hashit

            {
                name: 'hashit',
                group: internals.toolGroup,
                comment: 'make bcrypt hash of submitted pw',
                handler: function (pw, callback) {

                    console.log('test tool object executed. ' + JSON.stringify(param) );

                    callback(null, 'hey!!! hashit callback ran');

                }
            }
        ]);

    return sofaInternals;
};
