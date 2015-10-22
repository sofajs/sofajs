var Promise = require('bluebird');
var Hoek = require('hoek');
var Items = require('items');
var Bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

var internals = {};
var sofaInternals = {};


exports = module.exports = internals.User = function (sofaInternalsParam) {

    // console.log('loading user');

    internals.context = this;
    sofaInternals = sofaInternalsParam;

    internals.requestGroupName = 'user';

    sofaInternals.request.register(internals.requestGroupName)
        .requests([

            // list

            {
                name: 'list',
                group: internals.requestGroupName,
                comment: 'get all user records  \n' +
                         'gives an array of records to callback.',
                handler: function (callback) {

                    var listCallback = callback;

                    // check for connection errors
                    // all design functions create a db connection before executing the function.
                    // If connection has an error, err object will be in first parameter.

                    // if (arguments[0] && arguments[0].name === 'Error'){

                    //     callback(arguments[0]);
                    //     return this;
                    // }

                    return sofaInternals.db.view('user', 'list', function (err, body) {

                        if (!err) {

                            // console.log('email count: ' + body.rows.length);
                            // var i = 0;

                            return callback(null, body);
                        }

                        // return error

                        return callback(err, null);
                    });
                }
            },

            // first

            {
                name: 'first',
                group: internals.requestGroupName,
                comment: 'fetch first user record  \n',
                handler: function (callback) {

                    // optional check if connection working properly
                    // if (arguments[0] && arguments[0].name === 'Error'){

                    //     return callback(arguments[0]);
                    //     // return this;
                    // }

                    return sofaInternals.db.view('user', 'list', function (err, body) {

                        if (!err) {

                            // return first user record

                            return callback(null, body.rows[0].value);
                        }

                        // return error

                        return callback(err, null);
                    });
                }
            },

            // fetchByEmail

            {
                name: 'fetchByEmail',
                group: internals.requestGroupName,
                comment: 'request user record based on email key.\n' +
                         'utilizes **_design/user email** view. \n',
                handler: function (email, callback) {

                    if (arguments[0].name !== undefined && arguments[0].name === 'Error'){

                        return callback(arguments[0]);
                        // return this;
                    }

                    // console.log('fetchByEmail STARTED');

                    sofaInternals.db.view('user', 'email', { keys: [email] }, function (err, body) {

                        if (err) {

                            return callback(err, null);
                        }

                        // console.log('email count: ' + body.rows.length);

                        var record = body.rows[body.rows.length];
                        return callback(null, body);

                        // body.rows.forEach(function (doc) {

                        //     // @todo remove this
                        //     ++i;

                        //     if (i === body.rows.length) {
                        //         // return when last record is processed
                        //         return callback(null, body);
                        //     }
                        // });
                    });
                }
            },

            // fetchByUsername

            {
                name: 'fetchById',
                group: internals.requestGroupName,
                comment: 'request user record based on userId key.\n' +
                         'utilizes **_design/user userid** view. \n',
                handler: function (userid, callback) {

                    sofaInternals.db.view('user', 'userid', { keys: [userid] }, function (err, body) {

                        if (err) {

                            return callback(err, null);
                        }

                        // var record = body.rows[body.rows.length];
                        return callback(null, body);
                    });
                }
            },

            // update

            {
                name: 'update',
                group: internals.requestGroupName,
                comment: 'update existing document with modified data.\n' +
                         '#### Note:  \n' +
                         '**modifiedDocument** must be an existing document and have \n' +
                         'the "rev" value set in order for update to work.',
                handler: function (modifiedDocument, callback) {

                    // console.log('execute request function first()');

                    if (arguments[0].name !== undefined &&
                            arguments[0].name === 'Error')
                    {

                        return callback(arguments[0]);
                    }

                    // modified
                    sofaInternals.db.insert(modifiedDocument, function (err, result) {

                        // console.log('modify -- nano insert document completed: ' +
                        //     JSON.stringify(result));

                        return callback(null, result);
                    });
                }
            }
        ]);
};
