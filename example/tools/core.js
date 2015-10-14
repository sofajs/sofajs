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
                'description of tool placed here. use gfm to make it pretty.')
        .tools([

            // test

            {
                name: 'test',
                group: internals.toolGroup,
                comment: 'sofajs test tool object',
                handler: function (param, callback) {

                    internals.context = this;

                    console.log('test tool object executed. ' + JSON.stringify(param) );

                    callback(null, 'hey!!! tools.core.test callback ran');

                    return internals.context;
                }
            },

            // testdocs

            {
                name: 'testdocs',
                group: internals.toolGroup,
                comment: 'sofajs test tool object',
                handler: function (param, callback) {

                    internals.context = this;

                    console.log('test tool object executed. ' + JSON.stringify(param) );

                    return internals.context;
                }
            },

            // destroydb

            {
                name: 'destroydb',
                group: internals.toolGroup,
                comment: 'destroys database',
                handler: function (dbname, callback) {

                    internals.context = this;

                    console.log('destroy db executed.');

                    return internals.context;
                }
            },

            // insert

            {
                name: 'insert',
                group: internals.toolGroup,
                comment: 'insert documents function.',
                handler: function (documentToInsert, callback) {

                    console.log('tools.core.js: ' + JSON.stringify(sofaInternals.db));

                    sofaInternals.db.insert(documentToInsert, function (err, result) {

                        console.log('nano insert document completed: ' +
                            JSON.stringify(result));

                        return callback(null, result);
                    });
                }
            }, 

            // insertDesign

            {
                name: 'insertDesign',
                group: internals.toolGroup,
                comment: 'inserts a document with supplied id.',
                handler: function (designDoc, docId, callback) {

                    var designDocument = designDoc;
                    var documentId = docId;

                    // @todo change this to
                    // console.log('tools.core.insertid(): ' + JSON.stringify(sofaInternals.db));

                    sofaInternals.db.get(documentId, function(err, body) {

                        if (err && err.statusCode === 404) {

                            // design does not exist make it.

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

                        if (!err) {

                            // update existing design
                            // console.log('update existing design document: '+ body);

                            sofaInternals.db.insert({
                                _id: documentId, 
                                _rev: body._rev, 
                                views: designDocument.views, 
                                updates: designDocument.updates }, 
                                function (err, body) {

                                 console.log('updated the design document: '+ body);
                            });

                            return callback(null, body);
                        }
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

                    // @todo change this to
                    // console.log('tools.core.insertid(): ' + JSON.stringify(sofaInternals.db));

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

                    console.log('tools.core.findById() entered: ');

                    var id = documentId

                    sofaInternals.db.get(documentId, function(err, body) {

                        if (err && err.statusCode === 404) {

                            // record does not exist.

                            console.log('findById record not found');
                            console.log(err);
                        }

                        if (!err) {

                            console.log('findById: '+ body);

                            // update test

                            // sofaInternals.db.insert({_id: id, _rev: body._rev, views: {test: 'boom'} }, function (err, body) {

                            //     console.log('insert body: '+ body);
                            // });

                            return callback(null, body);
                        }
                    });
                }
            }, 
        ]);

    return sofaInternals;
};
