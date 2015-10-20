var Promise = require('bluebird');
var Hoek = require('hoek');
var Items = require('items');
var Bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

var internals = {};
var sofaInternals = {};


exports = module.exports = function (sofaInternalsParam) {

    internals.context = this;

    sofaInternals = sofaInternalsParam;

    internals.requestGroupName = 'core';

    sofaInternals.request.register(internals.requestGroupName).requests([

        // test

        {
            name: 'test',
            group: internals.requestGroupName,
            comment: 'sofajs test tool object',
            handler: function (param, callback) {

                internals.context = this;

                // console.log('test tool object executed. ' + JSON.stringify(param) );

                callback(null, 'hey!!! tools.core.test callback ran');

                return internals.context;
            }
        }

        // destroy

        // {
        //     name: 'destroy',
        //     group: internals.requestGroupName,
        //     comment: 'destroy a document\n' +
        //     '#### Note:  \n' +
        //     'documentToDestroy param must have _id and _rev values to destroy an existing document \n' +
        //     '#### callback(null, body) :  \n' +
        //     'body is couchdb response object. body.ok == true if succeeded.',
        //     handler: function (documentToDestroy, callback) {

        //         sofaInternals.db.destroy(documentToDestroy._id, documentToDestroy._rev, function (err, body) {

        //             if (!err) {
        //                 // console.log('boom' + JSON.stringify(body));
        //                 // expect(body.ok).to.equal(true);
        //                 return callback(null, body);
        //             }

        //             return callback(err, null);
        //         });
        //     }
        // }
    ]);
};
