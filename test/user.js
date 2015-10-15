var Code = require('code');
var Lab = require('lab');
var Path = require('path');
var Sofa = require('../lib');
var Compose = require('../example/sofafest');

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

    it('getUserByEmail', function (done) {

        internals.DB.requests.user.getByEmail('js@dali.photo', function (err, result) {

            // console.log('getByEmail result count: ' + result.rows.length);
            // console.log('user.getByEmail cb: result: ' + JSON.stringify(result));

            expect(result.rows.length).to.equal(1);
            expect(result.rows[0].value.first).to.equal('Jon');
            done();
        });
    });

    it('users', function (done) {

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

        internals.DB.requests.user.list(function (err, result) {

            // console.log('getByEmail result count: ' + result.rows.length);
            // console.log('user.getByEmail cb: result: ' + JSON.stringify(result));

            expect(result.rows.length).to.equal(3);
            expect(result.rows[0].value.first).to.equal('Foo');
            console.log('user.list: end: ' + result.rows[0].value.pw);
            done();
        });
        // internals.DB.requests.user.create(userRecord, function (err, result) {

        //     // console.log('getByEmail result count: ' + result.rows.length);
        //     // console.log('user.getByEmail cb: result: ' + JSON.stringify(result));

        //     expect(result.rows.length).to.equal(1);
        //     expect(result.rows[0].value.first).to.equal('Jon');
        //     done();
        // });
    });

});
