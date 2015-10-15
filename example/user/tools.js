var Promise = require('bluebird');
var Hoek = require('hoek');
var Bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

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
                handler: function (item, next) {

                    // console.log('hashit tool object executed. ' + JSON.stringify(item) );
                    // internals.pwToHash = pw;
                    // callback(null, 'hey!!! hashit callback ran');

                    Bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {

                        Bcrypt.hash(item.pw, salt, function (err, hash) {

                            // Store hash in your password DB.
                            item.pw = hash;
                            next();
                        });
                    });
                }
            }
        ]);

    return sofaInternals;
};
