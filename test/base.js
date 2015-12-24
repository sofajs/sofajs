var Async = require('async');
var Code = require('code');
var Lab = require('lab');
var Promise = require('bluebird');
// var Sofajs = require('sofajs');

var Sofajs = require('../lib');

// var Composer = require('../../lib/sofafest');
var Composer = require('../sample/lib/sofafest');

var lab = exports.lab = Lab.script();
var describe = lab.experiment;
var expect = Code.expect;
var it = lab.test;
var after = lab.after;


var internals = {};
var database = Sofajs.init(Composer.manifest, Composer.composeOptions);

describe('lib/base.js', function () {

    it('lib/base.js mock sofaInternals.connectPromise failure', function (done) {

        database.getSofaInternals(function (err, sofaInternals) {

            // mock nano couchdb session failure to connect.

            sofaInternals.session.date === undefined;

            var original = sofaInternals.connectPromise;

            // mock connectPromise error

            sofaInternals.connectPromise = function () {

                return new Promise(function (resolve, reject) {

                    var err = new Error('mock connectPromise error.');
                    return reject(err);
                });
            };

            return sofaInternals.connect(function (err) {

                expect(err.message).to.equal('mock connectPromise error.');
                sofaInternals.connectPromise = original;
                done();
            });
        });
        // var original = sofaInternals.connectPromise;
        // return new Promise( function (resolve, reject) {
        // sofaInternals.connectPromise = function () {
    });
});
