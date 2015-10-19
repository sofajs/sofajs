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

                    callback(null, 'hey!!! tools.core.test callback ran');

                    return internals.context;
                }
            },

            // insertDesign
            // XXXX removed this from core
            // now is in utils because sofajs depends on this should not be in
            // manifest documet.  manifest is to include plugins developed by the developer.

            {
                name: 'insertDesign',
                group: internals.toolGroup,
                comment: 'inserts a design document',
                handler: function (designDoc, docId, callback) {

                    var designDocument = designDoc;
                    var documentId = docId;

                    sofaInternals.db.get(documentId, function (err, body) {

                        if (err && err.statusCode === 404) {

                            // design does not exist make new one.

                            return sofaInternals.db.insert(designDocument, documentId, function (err, bodyResponse, headers) {

                                if (err) {

                                    // throw err;
                                    return callback(err, null);
                                    // return reject(err);
                                }

                                return callback(null, bodyResponse);
                            });
                        }


                        // update existing design
                        // console.log('update existing design document: '+ body);

                        sofaInternals.db.insert({
                            _id: documentId,
                            _rev: body._rev,
                            views: designDocument.views,
                            updates: designDocument.updates },
                            function (err, bodyResponse) {

                                return callback(null, bodyResponse);
                            });
                    });
                }
            },

            // insertid

            {
                name: 'insertid',
                group: internals.toolGroup,
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
            },
            {
                name: 'findById',
                group: internals.toolGroup,
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
            }
        ]);

    return sofaInternals;
};
