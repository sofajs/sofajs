// base.js
// sofajs base components

var Promise = require('bluebird');
var Hoek = require('hoek');

var internals = {};
var sofaInternals = {};


exports = module.exports =  internals.Utils = function (sofaInternalsParam) {

    sofaInternals = sofaInternalsParam;

    // connect

    sofaInternals.connect = function (callback) {

        // connect to couchdb
        // if no sessionid make new session.
        // if sessionid expired make new session
        // if sessionid ok, do nothing.

        // sofaInternals.credentials.db ;
        // sofaInternals.credentials.host ;
        // sofaInternals.credentials.user ;
        // sofaInternals.credentials.pw ;
        // sofaInternals.credentials.port ;
        // sofaInternals.session.life ;
        // sofaInternals.live = ;

        // internals.context = this;

        // check if db sessionid already exists
        // console.log('\n\033[34mutils.connect work here \033[0m');

        if (sofaInternals.session.date === undefined) {

            // console.log('\ndb.session.session.date is undefined -- make db.connection');

            sofaInternals.connectPromise()
               .then(function (connection) {

                   // console.log('connectionPromise.then() date: ' + connection.date);
                   // console.log('connectionPromise.then() sessionid: ' + connection.sessionid);

                   sofaInternals.session.date = connection.date;
                   sofaInternals.session.id = connection.sessionid;
                   sofaInternals.db = connection.db;

                   return callback(null);
                   // return 'promise connection completed';
               })
                .catch(function (err) {

                    var passErr = err;
                    // console.log('connectionPromise.catch() failed: ' + err);
                    // return 'promise connection err ' + err;
                    return callback(passErr);
                    // return sofaInternals;
                });

        } else {

            // sessionid alread created
            // ensure existing conneciton is ok.
            // later may want to drop checkConection logic here.

            // var sessionCreationDate = Date.parse(sofaInternals.session.date) - 600000;
            var sessionCreationDate = Date.parse(sofaInternals.session.date);
            var nowUnixTimeStamp = Date.now();
            var sessionLength = nowUnixTimeStamp - sessionCreationDate;

            if (sessionLength >= sofaInternals.session.life) {

                // sessionLength exceeds or equals session.life value
                // the session is expired, make new session.

                return sofaInternals.connectPromise()
                    .then(function (connection) {

                        // passConnection to keep connection object in scope
                        // if do not make variable object passes as a string.

                        sofaInternals.session.date = connection.date;
                        sofaInternals.session.id = connection.sessionid;
                        sofaInternals.db = connection.db;

                        var passConnection = true;

                        return callback(null, passConnection);
                        // return internals.context;
                    })
                    .catch(function (err) {

                        var passErr = err;
                        callback(passErr);
                        return sofaInternals;
                        // return internals.context;
                    });
            }

            // session is valid do nothing.
            // var passConnection = true;

            //console.log('session info already set -- date: ' + sofaInternals.session.date);
            //console.log('session info already set -- session.id: ' + sofaInternals.session.id);
            //console.log('session info already set -- session.db: ' + JSON.stringify(sofaInternals.db));

            return callback(null);
            // return internals.context;

        }
        return sofaInternals;
    };

    // isArray

    sofaInternals.isArray = function (value) {

        return value && typeof value === 'object' && value.constructor === Array;
    };

    //  connectPromise

    sofaInternals.connectPromise = function () {

        return new Promise( function (resolve, reject) {

            // sofaInternals.db initiated here.
            // May cause synchronization issues where logic depends on sofaInternals.db value for state.

            sofaInternals.db = require('nano')( sofaInternals.credentials.host + ':' + sofaInternals.credentials.port);

            // console.log(sofaInternals.credentials.user + '' +  sofaInternals.credentials.pw);

            sofaInternals.db.auth(sofaInternals.credentials.user, sofaInternals.credentials.pw, function (err, body, headers) {

                var sessionDate, sessionid;

                // var err = new Error('wacked error message');
                // console.log('connection body: ' + JSON.stringify(body));
                // console.log('connection headers: ' + JSON.stringify(headers)); cookie creation time here.
                if (err) {
                    // console.log('connectPromise err: ' + JSON.stringify(err));
                    reject(err);
                }

                if (headers && headers['set-cookie']) {
                    var session = headers['set-cookie'][0].match(/(?:[^\x00-\x20\(\)<>@\,;\:\\"\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\"\,\;\\\x7F]*))/);
                    // console.log('headers ' + JSON.stringify(headers));
                    // console.log('headers.date ' + JSON.stringify(headers.date));
                    // console.log('headers.date ' + JSON.stringify(internals.context.db.sessionDate));
                    sessionDate = headers.date;
                    sessionid = session[1];
                }

                // Make couchdb session and use db configs in sofafest.

                var connection = {
                    date: sessionDate,
                    sessionid: sessionid,
                    db: require('nano')({
                        url: sofaInternals.credentials.host + ':' + sofaInternals.credentials.port,
                        cookie: 'AuthSession=' + sessionid
                    }).use(sofaInternals.credentials.db)
                };

                // promise resolved
                resolve(connection);
            });
        });
    };

    sofaInternals.destroydb = function () {

        return new Promise( function (resolve, reject) {

            sofaInternals.connect(function (err) {

                if (err) {
                    return err;
                }

                // to destroy databases nano's object is needed:  nano.db
                // this may be confused with sofaInternals.db which is a refrence
                // to the project database being used in sofajs.

                var sofaconnection = require('nano')({
                    url: sofaInternals.credentials.host + ':' + sofaInternals.credentials.port,
                    cookie: 'AuthSession=' + sofaInternals.session.id
                });

                // console.log('got here1 '+ sofaconnection.db);

                sofaconnection.db.destroy(sofaInternals.credentials.db, function (err, body) {

                    if (err) {
                        return reject(err);
                    }

                    // console.log('destroyed');
                    return resolve('destroyed db: ' + sofaInternals.credentials.db);
                });
            });
        });
    };

    this.createdb = function (callback) {

        var sofaconnection = require('nano')({
            url: sofaInternals.credentials.host + ':' + sofaInternals.credentials.port,
            cookie: 'AuthSession=' + sofaInternals.session.id
        });

        sofaconnection.db.create(sofaInternals.credentials.db, function (err, body) {

            if (!err) {
                // console.log('database ' + sofaInternals.credentials.db +' created!');
                return callback(null, 'db: ' + sofaInternals.credentials.db + ' created');
            }

            // database already exists
            return callback(null, 'db: ' + sofaInternals.credentials.db + ' db already exists');
        });
    };

    this.load = function (callback) {

        internals.context = this;

        // recreate db

        // console.log('reload the database ' + sofaInternals.credentials.db);
        // console.log('db' + sofaInternals.db);


        // if project state live do not destroy db.
        // just update designs
        // @todo if true and db is not found
        // then create new db.

        if (sofaInternals.live === true) {

            sofaInternals.connect(function (err) {

                // console.log('connect error: ' + err);

                internals.context.createdb(function (err, createResponse) {

                    // console.log('live creatdb err: ' + err);
                    // console.log('live creatdb createResponse: ' + createResponse);
                    // successully created db, now load designs

                    internals.context.loadDesigns(function (err, response) {

                        if (err && err.message === 'missing') {
                            console.log('database does not exist');
                        }

                        // loaded designs and fixtures.
                        // console.log('designs loaded: ' + err);
                        // console.log('designs loaded: ' + response);
                    });
                });
            });
        }

        if (sofaInternals.live !== true) {

            // development state
            // destroydb and rebuild from scratch

            sofaInternals.destroydb()
                .then(function (response) {

                    // console.log('destroyed: ' + response);
                    // return callback(null, response);

                    // destroyed db, now make new one.

                    internals.context.createdb(function (err, createResponse) {

                        // console.log('createdb.live false' + ' ' + err + ' ' + createResponse);

                        if (!err) {
                            // console.log(response);

                            // successully created db, now load designs

                            internals.context.loadDesigns(function (err, loadResponse) {

                                // loaded designs and fixtures.

                                if (err) {
                                    // return error message
                                    return callback(err, null);
                                }

                                // no designs to load
                                // designs loaded
                                return callback(null, loadResponse);
                                // console.log('loadDesigns: err' + err);
                                // console.log('loadDesigns: loadResponse' + loadResponse);
                            });

                            // composer.loadDesigns or designs.loadDesigns
                        }
                    });
                })
                .catch(function (err) {

                    if (err.message === 'missing') {

                        // db not exists, so let's create one

                        return internals.context.createdb(function (err, response) {

                            if (!err) {

                                console.log('success: ' + response);

                                return;
                                // successully created db, now load designs
                            }
                            console.log('error: ' + err + ' ' + response);
                        });
                        // make new database
                        // callback(null, 'database d/n exist make new');
                    }

                    // return error message
                    // console.log('destroyed err: ' + err);
                    // return callback(err);
                });
        }
    };

    // insertDesign

    this.insertDesign = function (designDoc, docId, callback) {

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

            sofaInternals.db.insert({
                _id: documentId,
                _rev: body._rev,
                views: designDocument.views,
                updates: designDocument.updates },
                function (err, bodyResponse) {

                    return callback(null, bodyResponse);
                });
        });
    };

    this.countParams = function (requestFunction) {

        // introspection, count number of argments in function to build.
        // count number of commas between (), then add 1.
        // get signature from function

        var functionString = requestFunction.toString();
        var signatureBegin = functionString.search(/\({1}/) - 1;
        var signatureEnd = functionString.search(/\){1}/) + 1;
        var signature = functionString.slice(signatureBegin, signatureEnd);

        var count = 0;

        for (var i = 0; i < signature.length; ++i) {

            if (signature[i] === ',') {
                ++count;
            }
        };

        // add 1 to final count of parameters.

        ++count;

        // if one param, is string empty?

        if (count === 1) {

            var regex = /\(\s*\)/;

            if (signature.match(regex)) {

                // decrease params count to 0;
                --count;
            }
        }

        return count;
    };
    return this;
};
