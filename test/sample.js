// ./test/sample.js

var Code = require('code');
var Lab = require('lab');
// var Sofajs = require('sofajs');

var Sofajs = require('../lib');

// var Sofajs = require('../../sofajs/lib');
// var Composer = require('../lib/sofafest');
var Composer = require('../sample/lib/sofafest');

var lab = exports.lab = Lab.script();
var describe = lab.experiment;
var expect = Code.expect;
var it = lab.test;

// internals
// note: load database object into server.app.key in hapijs server.

var internals = {};
var database = Sofajs.init(Composer.manifest, Composer.composeOptions);


describe('initialization', function () {

    it('requests.event.test', function (done) {

        database.requests.event.test(function (err, result) {

            expect(result).to.equal('requests.event.test() executed');
            done();
        });
    });
});

