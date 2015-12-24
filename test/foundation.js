var Async = require('async');
var Code = require('code');
var Lab = require('lab');
// var Sofajs = require('sofajs');

var Sofajs = require('../lib');

// var Sofajs = require('../../../sofajs/lib');
// var Composer = require('../../lib/sofafest');
var Composer = require('../sample/lib/sofafest');

var lab = exports.lab = Lab.script();
var describe = lab.experiment;
var expect = Code.expect;
var it = lab.test;
var after = lab.after;


var internals = {};
var database = Sofajs.init(Composer.manifest, Composer.composeOptions);

describe('lib/foundation.js', function () {

    it('foundation.core.noparam', function (done) {

        var result = database.foundation.core.noparam();

        expect(result).to.be.an.object();
        // console.log('target: ' + JSON.stringify(result));
        // expect(database.foundation.core.noparam()).to.equal('foundation noparam executed');
        done();
    });

    it('foundation.core.oneparam', function (done) {

        // load foundation function with two params.

        database.foundation.core.oneparam(function (err, result) {

            expect(err).to.equal(null);
            expect(result).to.equal('Jon');
            done();
        });
    });
});
