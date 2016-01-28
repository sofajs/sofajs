var Promise = require('bluebird');
var Hoek = require('hoek');


var internals = {};
var sofaInternals = {};

exports = module.exports = internals.userDesign = function (sofaInternalsParam) {

    sofaInternals = sofaInternalsParam;
    internals.designGroup = 'user';

    // creates design document views functions
    // creates design document update functions
    // when not live
    //     - design documents are destroyed and recreated.
    //     - will reload design fixture data.
    // when live
    //     - design documents are updated instead of recreated.
    //     - fixture data not loaded.
    //

    sofaInternals.design.register(internals.designGroup)
        .design.views({

            //  _design/user view functions built below.
            //  http://localhost:5984/sofajs-sample/_design/user/_view/test
            // "npm run load" recreate project db an re-load all design functions.
            test: {
                map: function (doc) {

                    if (doc.username && doc.first) {

                        emit([doc._id, doc._rev], doc);
                    }
                },
                reduce: null  // optional
            },
            findByUsername: {
                map: function (doc) {

                    if (doc.username && doc.first) {

                        emit(doc.username, doc);
                    }
                },
                reduce: null
            },
            findByEmail: {
                map: function (doc) {

                    if (doc.username && doc.first) {

                        emit(doc.email, doc);
                    }
                },
                reduce: null
            },
            authenticate: {
                map: function (doc) {

                    if (doc.username && doc.first) {

                        emit([doc.username, doc.pw], doc);
                    }
                },
                reduce: null
            },
            findByUniqueUsername: {
                // find by _id
                map: function (doc) {

                    if (doc.type === 'username/unique') {

                        delete doc.pw;

                        emit(doc._id, doc);
                    }
                },
                reduce: null
            }
        }).design.updates({
            email: function (doc, req) {

                var request = JSON.parse(req.body);
                doc.email = request.email;
                return [doc, 'Edited email address.'];
            },
            password: function (doc, req) {

                var request = JSON.parse(req.body);
                doc.pw = request.password;
                return [doc, 'Updated password.'];
            },
            username: function (doc, req) {

                var request = JSON.parse(req.body);
                doc.username = request.username;
                return [doc, 'Updated username.'];
            },
            'bump-loginAttempts': function (doc, req) {

                var LOCKOUT_LENGTH = 60 * 1000 * 60 * 24; // 24 hours

                doc.loginAttempts += 1;

                if (doc.loginAttempts >= 10) {
                    doc.lockUntil = Date.now() + LOCKOUT_LENGTH;
                }

                return [doc, 'Bumped loginAttempts.'];
            },
            revertLockout: function (doc, req) {

                var LOCKOUT_LENGTH = 60 * 1000 * 60 * 24; // 24 hours

                doc.loginAttempts = 0;
                doc.lockUntil = Date.now() - LOCKOUT_LENGTH;

                return [doc, 'revertLockout succeeded.'];
            }
        }).design.fixtures([
            {
                username: 'Foo Foo',
                first: 'Foo',
                last: 'Foo',
                pw: 'foo',
                email: 'foo@hapiu.com',
                scope: ['admin', 'user'],
                loginAttempts: 0,
                lockUntil: Date.now() - 60 * 1000,
                created: Date.now()
            },
            {
                'username': 'Bar Head',
                'first': 'Bar',
                'last': 'Head',
                'pw': 'bar',
                'email': 'bar@hapiuni.com',
                'scope': ['user'],
                loginAttempts: 0,
                lockUntil: Date.now() - 60 * 1000,
                created: Date.now()
            },
            {
                username: 'user1',
                pw: '8899l1v3',
                email: 'js@dali.photo',
                first: 'Jon',
                last: 'Swenson',
                scope: ['admin', 'user'],
                loginAttempts: 0,
                lockUntil: Date.now() - 60 * 1000,
                created: Date.now()
            }]).design.load();

    return sofaInternals;
};
