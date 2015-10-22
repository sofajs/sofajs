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

describe('foundation', function () {

    it('test', function (done) {

        // test

        internals.DB.foundation.core.test(function (err, result) {

            // console.log('completed foundation test');
            expect(result).to.equal('foundation executed');
            return done();
        });
    });
});
