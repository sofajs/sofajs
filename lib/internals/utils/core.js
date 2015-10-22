// ./lib/internals/utils/core.js
// internal utility functions to be included in all sofajs applications.

var Promise = require('bluebird');
var Hoek = require('hoek');

var internals = {};
var sofaInternals = {};

exports = module.exports = function (sofaInternalsParam) {

    sofaInternals = sofaInternalsParam;

    internals.utilGroup = 'core';

    sofaInternals.utils.register(internals.utilGroup).utils.functions([
        {
            name: 'oneutil',
            group: internals.utilGroup,
            comment: 'oneutil test internal utility',
            handler: function () {

                console.log('YES!! oneutil test running');
            }
        },
        {
            name: 'twoutil',
            group: internals.utilGroup,
            comment: 'twoutil test internal utility',
            handler: function () {

                console.log('twoutil test running');
            }
        },
        {
            name: 'findById',
            group: internals.utilGroup,
            comment: 'find document by id.',
            handler: function (documentId, callback) {

                return sofaInternals.db.get(documentId, function (err, body) {

                    if (err && err.statusCode === 404) {

                        // record does not exist.

                        return callback(err, null);
                    }

                    return callback(null, body);
                });
            }
        },

        // destroy

        {
            name: 'destroy',
            group: internals.utilGroup,
            comment: 'destroy a document\n' +
            '#### Note:  \n' +
            'documentToDestroy param must have _id and _rev values to destroy an existing document \n' +
            '#### callback(null, body) :  \n' +
            'body is couchdb response object. body.ok == true if succeeded.',
            handler: function (documentToDestroy, callback) {

                sofaInternals.connect(function (err) {

                    if (err) {
                        return err;
                    }

                    sofaInternals.db.destroy(documentToDestroy._id, documentToDestroy._rev, function (err, body) {

                        if (!err) {
                            // console.log('boom' + JSON.stringify(body));
                            // expect(body.ok).to.equal(true);
                            return callback(null, body);
                        }

                        return callback(err, null);
                    });
                });
            }
        }
    ]);

    return sofaInternals;
};

