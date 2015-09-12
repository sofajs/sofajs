var Hoek = require('hoek');

var internals = {};
var sofaInternals = {};

exports = module.exports =  internals.Utils = function (sofaInternalsParam) {

    sofaInternals = sofaInternalsParam;
    console.log('Utils entered');
    console.log('insert.db: ' + JSON.stringify(sofaInternals.session));

    console.log('');


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

        console.log('\n\033[34mutils.connect work here \033[0m');

        if (sofaInternals.session.date === undefined) {

            console.log('\ndb.session.session.date is undefined -- make db.connection');

            sofaInternals.connectPromise()
               .then(function (connection) {

                    console.log('connectionPromise.then() date: ' + connection.date);
                    console.log('connectionPromise.then() sessionid: ' + connection.sessionid);

                    sofaInternals.session.date = connection.date;
                    sofaInternals.session.id = connection.sessionid;
                    sofaInternals.db = connection.db;

                    return callback(null);
                    // return 'promise connection completed';
                })
                .catch(function (err) {

                    var passErr = err;
                    console.log('connectionPromise.catch() failed: ' + err);
                    // return 'promise connection err ' + err;
                    return callback(passErr);
                    // return sofaInternals;
                });

        } else {

            // sessionid alread created
            // ensure existing conneciton is ok.
            // later may want to drop checkConection logic here.

            console.log('\ndb.sessionid exists -- make db.connection');

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

            console.log('session info already set -- date: ' + sofaInternals.session.date);
            console.log('session info already set -- session.id: ' + sofaInternals.session.id);
            console.log('session info already set -- session.db: ' + JSON.stringify(sofaInternals.db));

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

            console.log(sofaInternals.credentials.user + '' +  sofaInternals.credentials.pw);

            sofaInternals.db.auth(sofaInternals.credentials.user, sofaInternals.credentials.pw, function (err, body, headers) {

                var sessionDate, sessionid;

                // var err = new Error('wacked error message');
                // console.log('connection body: ' + JSON.stringify(body));
                // console.log('connection headers: ' + JSON.stringify(headers)); cookie creation time here.
                if (err) {
                    console.log('connectPromise err: ' + JSON.stringify(err));
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

    sofaInternals.insert = function (documentToInsert, callback) {

        var db = sofaInternals.db;

        console.log('insert.db: ' + JSON.stringify(sofaInternals.db));


        db.insert(documentToInsert, function (err, result) {

            console.log('nano insert document completed: ' + JSON.stringify(result));
            return callback(null, result);
        });
    };

    return this;
};
