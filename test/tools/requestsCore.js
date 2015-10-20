var Code = require('code');
var Lab = require('lab');
var Path = require('path');
var Sofa = require('../../lib');
var Compose = require('../../example/sofafest');
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

describe('requestsCore', function () {

    it('destroy record', function (done) {

        // requests.core.destroy coverage

        Async.waterfall([
            function (next) {

                // create record to delete

                internals.destroy = {};

                var userRecord = {
                    'username': 'Ponzo Fake',
                    'first': 'Ponzo',
                    'last': 'McFagen',
                    'pw': 'bar',
                    'email': 'ponzo@hapiu.com',
                    'scope': ['user'],
                    loginAttempts: 0,
                    lockUntil: Date.now() - 60 * 1000
                };

                var id = 'fake';

                internals.DB.requests.user.insertid(userRecord, id, function (err, result) {

                    expect(result.statusCode).to.equal(201);
                    // console.log('insertid: err' + err);
                    // console.log('destroy insertid: ' + JSON.stringify(result));
                    // console.log('destroy insert etag/rev: ' + JSON.stringify(result.etag));
                    // internals.destroy.rev = result.etag;
                    return next();
                });

            }, function (next) {

                var doc =  { id: 'destroy' };

                // get fake user document.
                // below fetch only gets user docs because uses user design

                internals.DB.requests.user.fetchById('fake', function (err, result) {

                    // console.log('destroy fetched: ' + JSON.stringify(result.rows[0].value));

                    internals.DB.getSofaInternals(function (err, sofaInternals) {

                        sofaInternals.utils.core.destroy(result.rows[0].value, function (err, result) {

                            //console.log('destroy ended:-) ' + internals.destroy.rev);
                            // console.log('destroy ended result: ' + JSON.stringify(result));
                            expect(result.ok).to.equal(true);
                            return next();
                        });
                    });
                });

            }], function (err) {

                delete internals.destroy;
                return done();
            });
    });

    it('destroyErr', function (done) {

        Async.waterfall([
            function (next) {

                // create record to delete

                internals.destroy = {};

                internals.DB.getSofaInternals(function (err, sofaInternals) {

                    // get internals object to create fake errors.

                    var original = sofaInternals.db.destroy;

                    // make fake nano destroy function to return error.
                    // requests.core.destroy uses this fake function.

                    sofaInternals.db.destroy = function (id, rev, callback) {

                        var fake = new Error('fake destroy document error');

                        callback(fake, null);
                    };

                    internals.DB.getSofaInternals(function (err, sofaInternals) {

                        sofaInternals.utils.core.destroy('fake-document', function (err, result) {

                            sofaInternals.db.destroy = original;
                            // expect(result.ok).to.equal(true);
                            expect(err.message).to.equal('fake destroy document error');
                            return next();
                        });
                    });
                });

            }, function (next) {

                next();
            }], function (err) {

                delete internals.destroy;
                // console.log('done destroyErr');
                return done();
            });
    });
});
