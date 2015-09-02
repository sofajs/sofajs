var Hoek = require('hoek');

var internals = {};
var sofaInternals = {};

exports = module.exports =  internals.Utils = function (sofaInternalsParam) {

    sofaInternals = sofaInternalsParam;

    this.connect = function (callback) {

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

        console.log('\n\033[34mconnect2 work here \033[0m');

        if (sofaInternals.db === undefined) {

            console.log('\ndb.sessionid is undefined -- make db.connection');

            internals.context.promises.connection.connect()
                .then(function (connection) {

                    internals.context.session.date = connection.date;
                    internals.context.session.id = connection.sessionid;
                    internals.context.db = connection.db;

                    var passConnection = true;

                    callback(null, passConnection);
                    return internals.context;
                })
                .catch(function (err) {

                    var passErr = err;
                    callback(passErr);
                    return internals.context;
                });
        } else {

            // sessionid alread created
            // ensure existing conneciton is ok.
            // later may want to drop checkConection logic here.

            console.log('\ndb.sessionid exists -- make db.connection');

            // var sessionCreationDate = Date.parse(internals.context.session.date) - 600000;
            var sessionCreationDate = Date.parse(internals.context.session.date);
            var nowUnixTimeStamp = Date.now();
            var sessionLength = nowUnixTimeStamp - sessionCreationDate;

            // console.log('sessionLength' + sessionLength);
            // console.log('sessionLife' + internals.context.session.life);

            if (sessionLength >= internals.context.session.life) {

                // sessionLength exceeds or equals session.life value
                // the session is expired, make new session.

                return internals.context.promises.connection.connect()
                    .then(function (connection) {

                        // passConnection to keep connection object in scope
                        // if do not make variable object passes as a string.

                        internals.context.session.date = connection.date;
                        internals.context.session.id = connection.sessionid;
                        internals.context.db = connection.db;

                        var passConnection = true;

                        callback(null, passConnection);
                        return internals.context;
                    })
                    .catch(function (err) {

                        var passErr = err;
                        callback(passErr);
                        return internals.context;
                    });
            }

            // session is valid do nothing.
            var passConnection = true;

            callback(null, passConnection);
            return internals.context;

        }
        return internals.context;
    };

    sofaInternals.isArray = function (value) {

        return value && typeof value === 'object' && value.constructor === Array;
    };


    return this;
};
