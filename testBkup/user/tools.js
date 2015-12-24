
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

describe('tools.user', function () {

    it('hashem', function (done) {


        internals.DB.getSofaInternals(function (err, sofaInternals) {

            // get internals object to create fake errors.

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

            // console.log('pw: ' + userRecord.pw.length);
            sofaInternals.tools.user.hashem(userRecord, function (err, result) {

                // console.log('fetchById result: ' + JSON.stringify(result));
                // console.log('fetchById err: ' + JSON.stringify(err));
                // console.log('pw: ' + userRecord.pw.length);
                expect(userRecord.pw.length).to.equal(60);
                return done();
            });
        });
    });
});
