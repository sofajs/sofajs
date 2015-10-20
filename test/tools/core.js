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

describe('tools.core', function () {

    it('findById', function (done) {

        internals.DB.getSofaInternals(function (err, sofaInternals) {

            // make connection

            sofaInternals.connect(function () {

                // get user record by email

                internals.DB.requests.user.fetchByEmail('js@dali.photo', function (err, result) {

                    internals.documentId = {};

                    // console.log('getByEmail result count: ' + result.rows.length);
                    // console.log('user.getByEmail cb: result: ' + JSON.stringify(result));

                    expect(result.rows.length).to.equal(1);
                    expect(result.rows[0].value.first).to.equal('Jon');

                    internals.documentId = result.rows[0].value._id;

                    // get user record using it's id

                    // sofaInternals.tools.core.findById(internals.documentId, function (err, documentBody) {
                    sofaInternals.utils.core.findById(internals.documentId, function (err, documentBody) {

                        //console.log(JSON.stringify(documentBody));
                        done();
                    });
                });
            });
        });
    });

    it('findById Err', function (done) {

        internals.DB.getSofaInternals(function (err, sofaInternals) {

            // make connection

            sofaInternals.connect(function () {

                // get user record by email

                internals.DB.requests.user.fetchByEmail('js@dali.photo', function (err, result) {

                    internals.documentId = {};

                    expect(result.rows.length).to.equal(1);
                    expect(result.rows[0].value.first).to.equal('Jon');

                    internals.documentId = result.rows[0].value._id;

                    // make documentId non-existing database.

                    internals.documentId = internals.documentId + 123;

                    sofaInternals.utils.core.findById(internals.documentId, function (err, documentBody) {

                        expect(err.statusCode).to.equal(404);
                        expect(err.message).to.equal('missing');
                        done();
                    });
                });
            });
        });
    });

    it('insertDesign', function (done) {

        internals.DB.getSofaInternals(function (err, sofaInternals) {

            // make connection

            sofaInternals.connect(function () {

                // create design to insert

                var testDesign = {
                    language: 'javascript',
                    views: {
                        list: {
                            map: function (doc) {

                                if (doc.username) {
                                    emit(doc._id , doc);
                                }
                            }
                        }
                    }
                };

                // insertDesign coverage here

                internals.DB.insertDesign(
                    testDesign,
                    '_design/boom',
                    function (err, result) {

                        expect(result.ok).to.equal(true);


                        var testDesign2 = {
                            language: 'javascript',
                            views: {
                                list: {
                                    map: function (doc) {

                                        if (doc.first) {
                                            emit(doc._id , doc.last);
                                        }
                                    }
                                }
                            }
                        };

                        // edit an existing designDocument

                        internals.DB.insertDesign(
                            testDesign2,
                            '_design/boom',
                            function (err, result) {

                                // cleanup
                                // destroy the document just created.

                                var destroyObject = {
                                    _id: result.id,
                                    _rev: result.rev
                                };

                                sofaInternals.utils.core.destroy(destroyObject, function (err, result) {

                                    // console.log('destroy ended result: ' + JSON.stringify(result));
                                    expect(result.ok).to.equal(true);

                                    return done();
                                });
                            });

                    });

            });
        });
    });

    it('insertDesign Err Coverage', function (done) {

        internals.DB.getSofaInternals(function (err, sofaInternals) {

            // make connection

            sofaInternals.connect(function () {

                // create design to insert

                var testDesign = {
                    language: 'javascript',
                    views: {
                        list: {
                            map: function (doc) {

                                if (doc.username) {
                                    emit(doc._id , doc);
                                }
                            }
                        }
                    }
                };

                var original = sofaInternals.db.insert;
                sofaInternals.db.insert = function (designDocument, documentId, callback) {

                    return callback(new Error('fake insert error'));
                };

                // insertDesign coverage here

                internals.DB.insertDesign(
                    testDesign,
                    '_design/boom',
                    function (err, result) {

                        sofaInternals.db.insert = original;
                        expect(err.message).to.equal('fake insert error');
                        done();
                    });
            });
        });
    });
});
