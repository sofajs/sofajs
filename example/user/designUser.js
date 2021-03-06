var Promise = require('bluebird');
var Hoek = require('hoek');

var internals = {};
var sofaInternals = {};

exports = module.exports = internals.userDesign = function (sofaInternalsParam, done) {

    sofaInternals = sofaInternalsParam;
    internals.designGroup = 'user';

    // fixtures.views = [{
    //     language: 'javascript',
    //     views: { list: {
    //         map: fixtures.users.list
    //     }
    //     }
    // }];

    sofaInternals.design.register(internals.designGroup)
        .design.views({

            // _design/user view functions built below.
            // "npm run reload" will refresh all design functions in the db.
            test: {
                map: function (doc) {

                    if (doc.language && doc.views) {

                        emit([doc._id, doc._rev], { views: doc.views });
                    }
                },
                reduce: null  // optional
            },

            // list users

            list: {
                map: function (doc) {

                    if (doc.username && doc.first && doc.last && doc.email) {
                        // :-)4 key is id an revision id.
                        emit([doc._id, doc._rev], doc);
                    }
                }
            },

            // firstName
            // search users by first name.

            firstName: {
                map: function (doc) {

                    if (doc.username && doc.first && doc.last && doc.email) {
                        // key is id an revision id.
                        emit(doc.first, { username: doc.username,
                            first: doc.first, last: doc.last, email: doc.email,
                        pw: doc.pw, scope: doc.scope,
                        loginAttempts: doc.loginAttempts,
                        lockUntil: doc.lockUntil });
                    }
                }
            },

            // email
            // search users by email.

            email: {
                map: function (doc) {

                    if (doc.username && doc.first && doc.last && doc.email) {
                        // key is id an revision id.
                        // emit(doc.email, {
                        //     username: doc.username,
                        //     first: doc.first, last: doc.last, email: doc.email,
                        //     pw: doc.pw, scope: doc.scope,
                        //     loginAttempts: doc.loginAttempts,
                        //     lockUntil: doc.lockUntil
                        // });
                        emit(doc.email, doc);
                    }
                }
            },

            // username
            // search users by email.

            username: {
                map: function (doc) {

                    if (doc.username && doc.first && doc.last && doc.email) {
                        // key is id an revision id.
                        emit(doc.username, doc);
                    }
                }
            },

            // userid
            // search users by userid.

            userid: {
                map: function (doc) {

                    if (doc.username && doc.first && doc.last && doc.email) {
                        // key is id an revision id.
                        emit(doc._id, doc);
                    }
                }
            }
        })
        .design.updates({

            // testUpdate design update function

            testUpdate: function () {

                console.log('wawee5 testUpdate boom');
            }
        })
        .design.fixtures([
            {
                username: 'Foo Foo',
                first: 'Foo',
                last: 'Foo',
                pw: 'foo',
                email: 'foo@hapiu.com',
                scope: ['admin', 'user'],
                loginAttempts: 0,
                lockUntil: Date.now() - 60 * 1000
            },
            {
                'username': 'Bar Head',
                'first': 'Bar',
                'last': 'Head',
                'pw': 'bar',
                'email': 'bar@hapiuni.com',
                'scope': ['user'],
                loginAttempts: 0,
                lockUntil: Date.now() - 60 * 1000
            },
            {
                username: 'user1',
                pw: '8899l1v3',
                email: 'js@dali.photo',
                first: 'Jon',
                last: 'Swenson',
                scope: ['admin', 'user'],
                loginAttempts: 0,
                lockUntil: Date.now() - 60 * 1000
            }])
        .design.load(done);

    return this;
};
