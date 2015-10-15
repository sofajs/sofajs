var Code = require('code');
var Lab = require('lab');
var Path = require('path');
var Sofa = require('../lib');
var Compose = require('../example/sofafest');
var Async = require('async');

var Hoek = require('hoek');

// Declare internals

var internals = {};

// Test shortcuts

var lab = exports.lab = Lab.script();
var describe = lab.experiment;
var before = lab.before;
var expect = Code.expect;
var it = lab.test;

internals.DB = Sofa.init(Compose.manifest, Compose.composeOptions);

describe('CRUD', function () {

    // before(function (done) {

    //     internals.DB.requests.user.hashization(function (err, result) {

    //         console.log('hashization result from callback: ' + result.rows[1].value.pw);
    //     });

    //     // Wait 1 second
    //     setTimeout( function () {

    //         done();
    //     }, 1000);
    // });

    it('fetchByEmail', function (done) {

        internals.DB.requests.user.fetchByEmail('js@dali.photo', function (err, result) {

            // console.log('getByEmail result count: ' + result.rows.length);
            // console.log('user.getByEmail cb: result: ' + JSON.stringify(result));

            expect(result.rows.length).to.equal(1);
            expect(result.rows[0].value.first).to.equal('Jon');
            return done();
        });
    });

    it('fetchByEmailError', function (done) {

        var emailError = new Error('fetchByEmail coverage');

        internals.DB.requests.user.fetchByEmail(emailError, function (err, result) {

            // console.log('getByEmail result count: ' + result.rows.length);
            // console.log('user.getByEmail cb: result: ' + JSON.stringify(result));

            expect(err).to.exist();
            expect(err.name).to.equal('Error');
            return done();
        });
    });

    it('fetchByEmailError nano view failure', function (done) {

        var sofaInternals = {};

        internals.DB.getSofaInternals(function (err, sofaInternalsObject) {

            sofaInternals = sofaInternalsObject;
            console.log('nano error' + sofaInternals);

            // sofaInternals.db.view('user', 'email', { keys: [email] }, function (err, body) {

            var original = sofaInternals.db.view;
            sofaInternals.db.view = function (view, email, keys, callback) {

                var err = new Error('Fake nano view error');
                return callback(err, 'boom');
            };

            internals.DB.requests.user.fetchByEmail('js@dali.photo', function (err, result) {

                // console.log('getByEmail result count: ' + result.rows.length);
                // console.log('user.getByEmail cb: result: ' + JSON.stringify(result));

                // console.log('target ' + err);
                sofaInternals.db.view = original;
                expect(err.message).to.equal('Fake nano view error');

                // expect(result.rows.length).to.equal(1);
                // expect(result.rows[0].value.first).to.equal('Jon');
                // expect(err).to.exist();
                // expect(err.name).to.equal('Error');
                return done();
            });
        });

    });

    it('users', function (done) {


        internals.DB.requests.user.list(function (err, result) {

            // expect(result.rows.length).to.equal(3);
            expect(result.rows[0].value.first).to.equal('Foo');
            console.log('user.list: end: ' + result.rows[0].value.pw);
            return done();
        });
    });


    it('first', function (done) {

        internals.DB.requests.user.first(function (err, result) {

            expect(result.username).to.equal('Foo Foo');
            expect(result.first).to.equal('Foo');
            return done();
        });
    });

    it('update', function (done) {

        internals.updateTest = {};

        Async.waterfall([
                function (next) {

                    // update first user document record.

                    internals.DB.requests.user.first(function (err, result) {

                        internals.updateTest.original = result.username;

                        result.username = 'waweee';

                        var modifiedDoc = result;

                        internals.DB.requests.user.update(modifiedDoc, function (err, result) {

                            internals.updateTest.id = result.id;

                            expect(internals.updateTest.id).to.have.length(32);
                            return next();
                        });
                    });
                }, function (next) {

                    // Change username back to original

                    internals.DB.requests.user.fetchByUserId(internals.updateTest.id, function (err, result) {

                        expect(result.rows.length).to.equal(1);
                        expect(result.rows[0].value.username).to.equal('waweee');

                        var editedDocument = result.rows[0].value;
                        editedDocument.username = internals.updateTest.original;

                        internals.DB.requests.user.update(editedDocument, function (err, result) {

                            internals.updateTest.id = result.id;

                            // changed document username back to original.
                            expect(result.id).to.have.length(32);
                            expect(result.ok).to.equal(true);
                            // console.log('final update result: ' + JSON.stringify(result));
                            // console.log('updated doc result id length: ' + JSON.stringify(internals.updateTest.id.length));
                            return next();
                        });
                    });
                }], function (err) {

                    delete internals.updateTest;
                    return done();
                });
    });

    it('updateError', function (done) {

        var modifiedDoc = new Error('updateError coverage');

        internals.DB.requests.user.update(modifiedDoc, function (err, result) {

            console.log('updateError: ' + err);
            console.log('updateError: ' + err.name);
            return done();
        });
    });

    it('insertid', function (done) {

        var userRecord = {
            'username': 'Ponzo McKee',
            'first': 'Ponzo',
            'last': 'McFagen',
            'pw': 'bar',
            'email': 'ponzo@hapiu.com',
            'scope': ['user'],
            loginAttempts: 0,
            lockUntil: Date.now() - 60 * 1000
        };

        var id = 'ponzo';

        internals.DB.requests.user.insertid(userRecord, id, function (err, result) {

            console.log('inserid: ' + result);
            return done();
        });
    });

    it('insertidError', function (done) {

        var insertidError = new Error('insertid coverage');

        var userRecord = {
            'username': 'Ponzo McKee',
            'first': 'Ponzo',
            'last': 'McFagen',
            'pw': 'bar',
            'email': 'ponzo@hapiu.com',
            'scope': ['user'],
            loginAttempts: 0,
            lockUntil: Date.now() - 60 * 1000
        };

        var id = 'ponzo';

        internals.DB.requests.user.insertid(insertidError, id, function (err, result) {

            console.log('inserid: ' + result);
            return done();
        });
    });
});
