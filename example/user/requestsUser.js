var Promise = require('bluebird');
var Hoek = require('hoek');
var Items = require('items');
var Bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

var internals = {};
var sofaInternals = {};


exports = module.exports = internals.User = function (sofaInternalsParam) {

    internals.context = this;
    sofaInternals = sofaInternalsParam;

    internals.requestGroupName = 'user';

    sofaInternals.request.register(internals.requestGroupName)
        .requests([

            // getuser

            {
                name: 'getuser',
                group: internals.requestGroupName,
                comment: 'get user function message created here  \n' +
                         '[link to google](http://www.google.com)',
                handler: function (params, callback) {

                    console.log('execute requests function getuser()');

                    // check for connection errors
                    // all design functions create a db connection before executing the function.
                    // If connection has an error, err object will be in first parameter.

                    if (arguments[0] && arguments[0].name === 'Error'){

                        callback(arguments[0]);
                        return this;
                    }

                    callback(null, 'requests getuser() succeeded');
                    return internals.context;
                }
            },

            // list

            {
                name: 'list',
                group: internals.requestGroupName,
                comment: 'get all user records  \n' +
                         'gives an array of records to callback.',
                handler: function (callback) {

                    var listCallback = callback;

                    console.log('execute requests function getuser()');

                    // check for connection errors
                    // all design functions create a db connection before executing the function.
                    // If connection has an error, err object will be in first parameter.

                    if (arguments[0] && arguments[0].name === 'Error'){

                        callback(arguments[0]);
                        return this;
                    }

                    return sofaInternals.db.view('user', 'list', function (err, body) {

                        if (!err) {

                            // console.log('email count: ' + body.rows.length);
                            // var i = 0;

                            return listCallback(null, body);

                            // body.rows.forEach(function (doc) {

                            //     // @todo remove this
                            //     ++i;

                            //     console.log('users() is running: ' + JSON.stringify(doc.value));
                            //     if (i === body.rows.length) {
                            //         // return when last record is processed
                            //         return callback(null, body);
                            //     }
                            // });
                        }
                    });

                    // callback(null, 'requests users() succeeded');
                    // return internals.context;
                }
            },

            // insertid

            {
                name: 'insertid',
                group: internals.requestGroupName,
                comment: 'insertid request made!!',
                handler: function (documentToInsert, documentId, callback) {

                    if (arguments[0] && arguments[0].name === 'Error'){

                        return callback(arguments[0]);
                        // return this;
                    }

                    sofaInternals.tools.core.insertid(documentToInsert, documentId, function (err, result) {

                        console.log('insertid err: ' + err + '\ninsertid result: ' + JSON.stringify(result));

                        return callback(null, result);
                    });

                }
            },

            // getUserByEmail

            {
                name: 'getByEmail',
                group: internals.requestGroupName,
                comment: 'request user record based on email key.',
                handler: function (email, callback) {

                    if (arguments[0] && arguments[0].name === 'Error'){

                        return callback(arguments[0]);
                        // return this;
                    }

                    console.log('getByEmail STARTED');

                    return sofaInternals.db.view('user', 'email', { keys: [email] }, function (err, body) {

                        if (!err) {

                            // console.log('email count: ' + body.rows.length);
                            var i = 0;

                            body.rows.forEach(function (doc) {

                                // @todo remove this
                                ++i;

                                if (i === body.rows.length) {
                                    // return when last record is processed
                                    return callback(null, body);
                                }
                            });
                        }
                    });
                }
            },

            // hashization

            {
                name: 'hashization',
                group: internals.requestGroupName,
                comment: 'hash all passwords in fixtures data.',
                handler: function (callback) {

                    internals.userList = {};

                    if (arguments[0] && arguments[0].name === 'Error'){

                        return callback(arguments[0]);
                        // return this;
                    }

                    return sofaInternals.requests.user.list(function (err, result) {

                        // @todo cleanup this userList
                        // duplicate variables overkill.
                        internals.userList = Hoek.clone(result);
                        internals.userList.count = 0;

                        if (!err) {

                            Items.serial(internals.userList.rows,
                                function (item, next) {

                                    internals.next = next;
                                    internals.password = Hoek.clone(item.value.pw);
                                    internals.hashedPassword = item.value.pw;

                                    // console.log('processing item ' + item.value.first);

                                    // hash pw for user

                                    Bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {

                                        Bcrypt.hash(internals.password, salt, function (err, hash) {

                                            // Store hash in your password DB.
                                            console.log('hashed pw result: ' + hash);
                                            internals.hashedPassword = hash;
                                            internals.userList.rows[internals.userList.count].value.pw = hash;
                                            console.log('set: ' + internals.userList.rows[internals.userList.count].value.pw);
                                            ++internals.userList.count;
                                            internals.next();
                                        });
                                    });
                                },
                                function (err) {

                                    console.log('done items ' + err);
                                    console.log('done items 2' + internals.userList.rows[0].value.pw);
                                    var boom = Hoek.clone(internals.userList);
                                    return callback(null, boom);
                                });
                        }
                    });


                    // return when last record is processed
                    // return callback(null, 'done hashization');
                }
            }
        ]);
};
