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
            },

            // insertid

            {
                name: 'insertid',
                group: internals.foundationGroupName,
                comment: 'inserts a document with supplied id.',
                handler: function (designDoc, docId, callback) {

                    var designDocument = designDoc;
                    var documentId = docId;

                    return sofaInternals.db.insert(designDocument, documentId, function (err, body, headers) {

                        if (err) {

                            // throw err;
                            return callback(err, headers);
                            // return reject(err);
                        }

                        // console.log('nano insertid document completed \'headers\': ' +
                        //    JSON.stringify(headers));

                        return callback(null, headers);
                    });
                }
            }
        ]);

    return sofaInternals;
};
