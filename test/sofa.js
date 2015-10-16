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
var expect = Code.expect;
var it = lab.test;

internals.DB = Sofa.init(Compose.manifest, Compose.composeOptions);

describe('initialization', function () {

    it('sofa init', function (done) {

        var manifest = 'manifest.';
        var composeOptions = 'options.file';

        // var DB = Sofa.init(manifest, composeOptions);

        expect(internals.DB.identity).to.equal('composer');
        // console.log(DB.identity);

        var sofaInternalsclone = {};

        internals.DB.getSofaInternals(function (err, sofaInternals) {

            sofaInternalsclone = sofaInternals;

            // sofaInternalsclone.promises.general.insert({ name: 'hi promise' });

            sofaInternalsclone.promises.general.test({ err: false })
                .then(function (result) {

                    expect(result).to.equal('test promise returning data haha!!');
                    // console.log('test promise result ' + JSON.stringify(result));
                    done();
                }).catch(function (err) {

                    //console.log('test promise err' + JSON.stringify(err));
                    done();
                });
        });
    });

    it('sofa initErr', function (done) {

        expect(internals.DB.identity).to.equal('composer');

        var sofaInternalsclone = {};

        internals.DB.getSofaInternals(function (err, sofaInternals) {

            // sofaInternalsclone = sofaInternals;

            sofaInternals.promises.general.test({ err: true })
                .then(function (result) {

                    expect(result).to.equal('test promise returning data haha!!');
                    // console.log('test promise result ' + JSON.stringify(result));
                    done();
                }).catch(function (err) {

                    expect(err).to.equal(true);
                    //console.log('test promise err' + JSON.stringify(err));
                    done();
                });
        });
    });

    it('composer tools core loaded', function (done) {

        // var DB = Sofa.init(manifest, composeOptions);

        expect(internals.DB.identity).to.equal('composer');
        // console.log(DB.identity);

        internals.DB.getSofaInternals(function (err, sofaInternals) {

            sofaInternals.tools.core.test({ test: 'param sent' }, function (err, result) {

                // console.log('test() ' + result);
                done();
            });
        });
    });
});
