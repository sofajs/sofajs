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
                'description of tool use gfm')
        .tools([

            // test

            {
                name: 'test',
                group: internals.toolGroup,
                comment: 'sofajs test tool object',
                handler: function (param, callback) {

                    internals.context = this;

                    console.log('test tool object executed. ' + JSON.stringify(param) );

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
            }

            // connect

            //{
            //    name: 'connect',
            //    group: internals.toolGroup,
            //    comment: 'ensure connection to database',
            //    handler: function (callback) {

            //        // originally was using this for making connection
            //        // but moved logic to utils module.

            //        internals.context = this;

            //        // check if db sessionid already exists

            //        console.log('\n\033[34mconnect work here \033[0m');

            //        if (internals.context.db === undefined) {

            //            console.log('\ndb.sessionid is undefined -- make db.connection');

            //            internals.context.promises.connection.connect()
            //                .then(function (connection) {

            //                    // passConnection to keep connection object in scope
            //                    // if do not make variable object passes as a string.

            //                    var passConnection = connection;

            //                    return callback(null, passConnection);
            //                })
            //                .catch(function (err) {

            //                    var passErr = err;
            //                    return callback(passErr);
            //                });
            //        } else {

            //            console.log('\ndb.sessionid exists -- make db.connection');

            //            console.log('db.sessionid setpromise connect() sessionid: ' + db.sessionid + ' sessionDate: ' + db.sessionDate);
            //        }


            //    }
            //}
        ]);

    return sofaInternals;
};
