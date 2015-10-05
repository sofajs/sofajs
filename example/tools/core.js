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
                comment: 'inserts document',
                handler: function (documentToInsert, callback) {

                    console.log('tools.core.js: ' + JSON.stringify(sofaInternals.db));

                    sofaInternals.db.insert(documentToInsert, function (err, result) {

                        console.log('nano insert document completed: ' +
                            JSON.stringify(result));

                        return callback(null, result);
                    });
                }
            }, 

            // insertid
            {
                name: 'insertid',
                group: internals.toolGroup,
                comment: 'inserts a document with supplied id.',
                handler: function (documentToInsert, documentId, callback) {

                    console.log('tools.core.insertid(): ' + JSON.stringify(sofaInternals.db));

                    return sofaInternals.db.insert(documentToInsert, documentId, function (err, body, headers) {

                        if (err) {

                            throw err;
                            // return reject(err);
                        }

                        console.log('nano insertid document completed \'headers\': ' +
                            JSON.stringify(headers));

                        return callback(null, headers);
                    });
                }
            }, 
        ]);

    return sofaInternals;
};
