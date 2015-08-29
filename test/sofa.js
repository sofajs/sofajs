var Code = require('code');
var Lab = require('lab');
var Path = require('path');

var Sofa = require('../lib');

var Hoek = require('hoek');

// Declare internals

var internals = {};

// Test shortcuts

var lab = exports.lab = Lab.script();
var describe = lab.experiment;
var expect = Code.expect;
var it = lab.test;

describe('initialization', function () {

    it('sofa init', function (done) {

        var manifest = 'manifest.';
        var composeOptions = 'options.file';

        var DB = Sofa.init(manifest, composeOptions);

        console.log(DB.identity);
        done();
    });
});
