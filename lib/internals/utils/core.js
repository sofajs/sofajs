// ./lib/internals/utils/core.js
// internal utility functions to be included in all sofajs applications.
// originally built this but then made foundation.
// prefer foundation name but leaving this in case later want to utilize it.
// Otherwise, the utils object will be removed.

var Async = require('async');
var Promise = require('bluebird');
var Hoek = require('hoek');
var Bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

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
        }
        // {
        //     name: 'twoutil',
        //     group: internals.utilGroup,
        //     comment: 'twoutil test internal utility',
        //     handler: function () {

        //         console.log('twoutil test running');
        //     }
        // },
        // {
        //     name: 'findById',
        //     group: internals.utilGroup,
        //     comment: 'find document by id.',
        //     handler: function (documentId, callback) {

        //         return sofaInternals.db.get(documentId, function (err, body) {

        //             if (err && err.statusCode === 404) {

        //                 // record does not exist.

        //                 return callback(err, null);
        //             }

        //             return callback(null, body);
        //         });
        //     }
        // },

        // destroy

        // {
        //     name: 'destroy',
        //     group: internals.utilGroup,
        //     comment: 'destroy a document\n' +
        //     '#### Note:  \n' +
        //     'documentToDestroy param must have _id and _rev values to destroy an existing document \n' +
        //     '#### callback(null, body) :  \n' +
        //     'body is couchdb response object. body.ok == true if succeeded.',
        //     handler: function (documentToDestroy, callback) {

        //         sofaInternals.connect(function (err) {

        //             if (err) {
        //                 return err;
        //             }

        //             sofaInternals.db.destroy(documentToDestroy._id, documentToDestroy._rev, function (err, body) {

        //                 if (!err) {
        //                     // console.log('boom' + JSON.stringify(body));
        //                     // expect(body.ok).to.equal(true);
        //                     return callback(null, body);
        //                 }

        //                 return callback(err, null);
        //             });
        //         });
        //     }
        // },

        // hashem

        // {
        //     name: 'hashem',
        //     group: internals.utilGroup,
        //     comment: 'make bcrypt hash of submitted pw',
        //     handler: function (item, next) {

        //         // console.log('hashit tool object executed. ' + JSON.stringify(item) );
        //         // internals.pwToHash = pw;
        //         // callback(null, 'hey!!! hashit callback ran');

        //         Bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {

        //             Bcrypt.hash(item.pw, salt, function (err, hash) {

        //                 // Store hash in your password DB.
        //                 item.pw = hash;
        //                 next();
        //             });
        //         });
        //     }
        // }
    ]);

    return sofaInternals;
};

