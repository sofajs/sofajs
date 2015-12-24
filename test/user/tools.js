var Code = require('code');
var Lab = require('lab');
var Joi = require('joi');
// var Sofajs = require('sofajs');
var Sofajs = require('../../lib');

// var Sofajs = require('../../../sofajs/lib');
// var Composer = require('../../lib/sofafest');
var Composer = require('../../sample/lib/sofafest');

var lab = exports.lab = Lab.script();
var describe = lab.experiment;
var expect = Code.expect;
var it = lab.test;

var internals = {};
var database = Sofajs.init(Composer.manifest, Composer.composeOptions);

describe('uniqueUsername Create, Destroy, & Update', function () {

    // test enforcement of unique values in user documents.

    it('tools.user.uniqueUsernameCreate success', function (done) {

        // uniqueUsernameCreate

        database.getSofaInternals(function (err, sofaInternals) {

            sofaInternals.tools.user.uniqueUsernameCreate(internals.mockUser1.username, function (err, documentId, documentRev) {

                expect(documentId).to.equal('username/' + internals.mockUser1.username);

                var splitRevisionId = documentRev.split('-');
                expect(splitRevisionId[1]).to.have.length(32);
                done();
            });
        });
    });

    it('tools.user.uniqueUsernameCreate fail username already exists.', function (done) {

        // uniqueUsernameCreate
        // fails because username already exists.

        database.getSofaInternals(function (err, sofaInternals) {

            sofaInternals.tools.user.uniqueUsernameCreate(internals.mockUser1.username, function (err, documentId, documentRev) {

                expect(err).to.exist();
                expect(err).to.equal('uuid already exists.');
                done();
            });
        });
    });

    it('tools.user.uniqueUsernameCreate mock failure of function.core.insertid.', function (done) {

        // uniqueUsernameCreate
        // fails because username already exists.

        database.getSofaInternals(function (err, sofaInternals) {

            var original = sofaInternals.foundation.core.insertid;

            sofaInternals.foundation.core.insertid = function (documentToInsert, uniqueIdToInsert, callback) {

                sofaInternals.foundation.core.insertid = original;
                return callback(new Error('Mock foundation.insertid failure.'), null, null);
            };

            sofaInternals.tools.user.uniqueUsernameCreate(internals.mockUser1.username, function (err, documentId, documentRev) {

                expect(err).to.exist();
                expect(err).to.equal('Error: foundation.core.insertid failed.');
                done();
            });
        });
    });

    it('tools.user.uniqueUsernameDestroy success.', function (done) {

        // uniqueUsernameDestroy

        database.getSofaInternals(function (err, sofaInternals) {

            sofaInternals.tools.user.uniqueUsernameDestroy(internals.mockUser1.username, function (err, result) {

                // console.log('destroy: ' + JSON.stringify(err) + ' ' + JSON.stringify(result));
                expect(err).to.not.exist();
                expect(result.id).to.equal('username/' + internals.mockUser1.username);
                // expect(result.rev).to.have.length(34);
                var splitRevisionId = result.rev.split('-');
                expect(splitRevisionId[1]).to.have.length(32);
                done();
            });
        });
    });

    it('tools.user.uniqueUsernameDestroy failure document was already deleted.', function (done) {

        // uniqueUsernameDestroy
        // fails because username document was already deleted.
        // note, couchdb throws different errors for trying to destroy documents whose id d/n exist
        // versus documents which was already deleted.

        database.getSofaInternals(function (err, sofaInternals) {

            sofaInternals.tools.user.uniqueUsernameDestroy('username/' + internals.mockUser1.username, function (err, result) {

                expect(err).to.exist();
                expect(err).to.equal('Document does not exist.');
                done();
            });
        });
    });

    it('tools.user.uniqueUsernameDestroy fail because document d/n exists.', function (done) {

        // uniqueUsernameDestroy
        // fails because username d/n exists.

        database.getSofaInternals(function (err, sofaInternals) {

            sofaInternals.tools.user.uniqueUsernameDestroy('username/boom', function (err, result) {

                expect(err).to.exist();
                expect(err).to.equal('Document does not exist.');
                done();
            });
        });
    });

    it('tools.user.uniqueUsernameDestroy mock nano.get() failure.', function (done) {

        // uniqueUsernameDestroy
        // fails because username d/n exists.

        database.getSofaInternals(function (err, sofaInternals) {

            var original = sofaInternals.db.get;

            sofaInternals.db.get = function (documentName, params, callback) {

                sofaInternals.db.get = original;
                return callback(new Error('Mock sofaInternals.db.get failure.'), null, null);
            };

            sofaInternals.tools.user.uniqueUsernameDestroy('username/' + internals.mockUser1.username, function (err, result) {

                expect(err).to.exist();
                expect(err).to.equal('couchdb request failed.');
                done();
            });
        });
    });

    it('tools.user.uniqueUsernameCreate success recreate destroyed user.', function (done) {

        // uniqueUsernameCreate

        database.getSofaInternals(function (err, sofaInternals) {

            sofaInternals.tools.user.uniqueUsernameCreate(internals.mockUser1.username, function (err, documentId, documentRev) {

                expect(documentId).to.equal('username/' + internals.mockUser1.username);
                // expect(documentRev).to.have.length(34);
                var splitRevisionId = documentRev.split('-');
                expect(splitRevisionId[1]).to.have.length(32);
                done();
            });
        });
    });

    it('tools.user.uniqueUsernameDestroy mock sofaInternals.db.destroy() failure.', function (done) {

        // uniqueUsernameDestroy
        // fails because username d/n exists.

        database.getSofaInternals(function (err, sofaInternals) {

            var original = sofaInternals.db.destroy;

            sofaInternals.db.destroy = function (documentName, params, callback) {

                sofaInternals.db.destroy = original;
                return callback(new Error('Mock sofaInternals.db.destroy failure.'), null);
            };

            sofaInternals.tools.user.uniqueUsernameDestroy(internals.mockUser1.username, function (err, result) {

                expect(err).to.exist();
                expect(err).to.equal('failed to destroy the record.');
                done();
            });
        });
    });

    it('tools.user.uniqueUsernameUpdate success', function (done) {

        return database.getSofaInternals(function (err, sofaInternals) {

            var newUsername = 'uniqueUsernameUpdated1';

            return sofaInternals.tools.user.uniqueUsernameUpdate('username/' + internals.mockUser1.username, newUsername,
                function (err, updatedUsername, updatedUsernameRev) {

                    if (err) {
                        return done();
                    }

                    // console.log('result: ' + updatedUsername);
                    expect(updatedUsername).to.equal('username/' + newUsername);
                    return  done();
                });
        });
    });


    it('tools.user.uniqueUsernameUpdate success prefix coverage', function (done) {

        return database.getSofaInternals(function (err, sofaInternals) {

            var newUsername = 'username/uniqueUsernameUpdated';

            return sofaInternals.tools.user.uniqueUsernameUpdate('username/uniqueUsernameUpdated1', newUsername,
                function (err, updatedUsername, updatedUsernameRev) {

                    if (err) {
                        return done();
                    }

                    expect(updatedUsername).to.equal(newUsername);
                    return  done();
                });
        });
    });

    it('tools.user.uniqueUsernameUpdate fail update username already exists', function (done) {

        database.getSofaInternals(function (err, sofaInternals) {

            // user already updated to this value.
            // update query should fail.

            var newUsername = 'uniqueUsernameUpdated';

            sofaInternals.tools.user.uniqueUsernameUpdate('username/userfail', newUsername,
                function (err, updatedUsername, updatedUsernameRev) {

                    if (err) {
                        expect(err).to.equal('uuid already exists.');
                        return done();
                    }
                });
        });
    });


    it('tools.user.uniqueUsernameUpdate failed to destroy old username.', function (done) {

        database.getSofaInternals(function (err, sofaInternals) {

            // user already updated to this value.
            // update query should fail.

            var newUsername = 'uniqueUserBoomFail';

            sofaInternals.tools.user.uniqueUsernameUpdate('boom', newUsername,
                function (err, updatedUsername, updatedUsernameRev) {

                    if (err) {
                        expect(err).to.equal('Reverted transaction. uniqueDestroy failed.');
                        return done();
                    }
                });
        });
    });

    it('tools.user.uniqueUsernameCreate reload \'uniqueuser\' which was previously changed/updated.', function (done) {

        // uniqueUsernameCreate

        database.getSofaInternals(function (err, sofaInternals) {

            sofaInternals.tools.user.uniqueUsernameCreate(internals.mockUser1.username, function (err, documentId, documentRev) {

                expect(documentId).to.equal('username/' + 'uniqueuser');
                // split documentRev at - because rev count will keep increasing
                // causing test to fail when length becomes longer.
                var splitRevisionId = documentRev.split('-');
                expect(splitRevisionId[1]).to.have.length(32);
                done();
            });
        });
    });

    it('user.uniqueGet success', function (done) {

        database.getSofaInternals(function (err, sofaInternals) {

            sofaInternals.foundation.core.uniqueGet('username/uniqueuser', function (err, result) {

                expect(err).to.equal(null);
                expect(result._id).to.equal('username/uniqueuser');
                expect(result._rev).to.exist();
                done();
            });
        });
    });

    it('user.uniqueGet fail', function (done) {

        database.getSofaInternals(function (err, sofaInternals) {

            sofaInternals.foundation.core.uniqueGet('boom', function (err, result) {

                expect(err).to.exist();
                expect(err).to.equal('uuid does not exist.');
                done();
            });
        });
    });

    it('cleanup', function (done) {

        database.foundation.core.uniqueDestroy('username/uniqueUsernameUpdated', function (err, result) {

            expect(err).to.equal(null);
            // console.log('cleanup1 ' + JSON.stringify(result));
            database.foundation.core.uniqueDestroy('username/' + internals.mockUser1.username, function (err2, result2) {

                expect(err2).to.equal(null);
                done();
            });
        });
    });
    // cleanup
    // username/uniqueUsernameUpdated
    // username/uniqueuser
});


describe('tools.user.hashem', function () {

    it('tools.user.hashem Bcrypt.genSalt failed', function (done) {

        var Bcrypt = require('bcrypt');

        // return Bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        var original = Bcrypt.genSalt;

        Bcrypt.genSalt = function (SALT_WORK_FACTOR, callback) {

            Bcrypt.genSalt = original;

            return callback(new Error('genSalt failed'), null);
        };

        database.getSofaInternals(function (err, sofaInternals) {

            sofaInternals.tools.user.hashem('password_to_hash', function (err, salt) {

                expect(err).to.equal('failed to generate salt.');
                done();
            });
        });
    });

    it('tools.user.hashem Bcrypt.hash failed', function (done) {

        var Bcrypt = require('bcrypt');

        var original = Bcrypt.hash;

        Bcrypt.hash = function (password, salt, callback) {

            Bcrypt.hash = original;
            return callback(new Error('hash failed'), null);
        };

        database.getSofaInternals(function (err, sofaInternals) {

            sofaInternals.tools.user.hashem('password_to_hash', function (err, salt) {


                expect(err).to.equal('failed to generate the hash.');
                // console.log('hashem bcryptMessage' + JSON.stringify(err.bcryptMessage.message));
                done();
            });
        });
    });
});

describe('tools.user.validatePassword', function () {

    it('tools.user.validatePassword validate valid pw', function (done) {

        database.getSofaInternals(function (err, sofaInternals) {

            //var password = 'bo-isTss@s"PZ';
            var password = '3b0ss`_T4ss@sPZ';

            sofaInternals.tools.user.validatePassword(password, function (err, result) {

                // expect(err.message).to.equal('Bcrypt.hash() failed to generate the hash.');

                expect(result).to.equal(true);
                // console.log('password validation error: ' + JSON.stringify(err) + ' result ' + JSON.stringify(result));
                done();
            });
        });
    });

    it('tools.user.validatePassword lowercase letters not valid', function (done) {

        database.getSofaInternals(function (err, sofaInternals) {

            //var password = 'bo-isTss@s"PZ';
            var password = '3b0`_T4s@P';

            sofaInternals.tools.user.validatePassword(password, function (err, result) {

                // expect(err.message).to.equal('Bcrypt.hash() failed to generate the hash.');

                expect(result).to.equal(false);
                expect(err).to.equal('lowercase letters not valid');
                done();
            });
        });
    });

    it('tools.user.validatePassword uppercase letters not valid', function (done) {

        database.getSofaInternals(function (err, sofaInternals) {

            //var password = 'bo-isTss@s"PZ';
            var password = '3b0ss`_T4ss@s';

            sofaInternals.tools.user.validatePassword(password, function (err, result) {

                // expect(err.message).to.equal('Bcrypt.hash() failed to generate the hash.');

                expect(result).to.equal(false);
                expect(err).to.equal('uppercase letters not valid');
                done();
            });
        });
    });

    it('tools.user.validatePassword special chars not valid', function (done) {

        database.getSofaInternals(function (err, sofaInternals) {

            var password = '3b0ss_T4sPZ';

            sofaInternals.tools.user.validatePassword(password, function (err, result) {

                // expect(err.message).to.equal('Bcrypt.hash() failed to generate the hash.');

                expect(result).to.equal(false);
                expect(err).to.equal('special characters not valid');
                done();
            });
        });
    });

    it('tools.user.validatePassword digits not valid', function (done) {

        database.getSofaInternals(function (err, sofaInternals) {

            var password = 'b0ss`_Tss@sPZ';

            sofaInternals.tools.user.validatePassword(password, function (err, result) {

                // expect(err.message).to.equal('Bcrypt.hash() failed to generate the hash.');

                expect(result).to.equal(false);
                expect(err).to.equal('digits not valid');
                done();
            });
        });
    });

    it('tools.user.validatePassword mock Joi failure', function (done) {

        var original = Joi.validate;

        Joi.validate = function (passwordToValidate, schema, callback) {

            // mock Joi style error message

            var err = { details: [{ message: 'Joi failed' }] };

            Joi.validate = original;

            return callback(err, null);
        };

        database.getSofaInternals(function (err, sofaInternals) {

            var password = '3b0ss`_T4sPZ';

            sofaInternals.tools.user.validatePassword(password, function (err, result) {

                expect(result).to.equal(false);
                expect(err.details[0].message).to.equal('Joi failed');
                done();
            });
        });
    });
});

describe('tools.user.generateUniqueValues', function () {

    it('tools.user.generateUniqueValues load username fixture record.', function (done) {

        database.getSofaInternals(function (err, sofaInternals) {

            sofaInternals.tools.user.uniqueUsernameCreate(internals.mockUser1.username, function (err, documentId, documentRev) {

                expect(documentId).to.equal('username/' + internals.mockUser1.username);

                var splitRevisionId = documentRev.split('-');
                expect(splitRevisionId[1]).to.have.length(32);
                done();
            });
        });
    });

    it('tools.user.generateUniqueValues load email fixture record.', function (done) {

        database.getSofaInternals(function (err, sofaInternals) {

            sofaInternals.tools.user.uniqueEmailCreate(internals.mockUser1.email, function (err, documentId, documentRev) {

                expect(documentId).to.equal('useremail/' + internals.mockUser1.email);

                var splitRevisionId = documentRev.split('-');
                expect(splitRevisionId[1]).to.have.length(32);
                done();
            });
        });
    });


    it('tools.user.generateUniqueValues fail mock failure of foundation.core.uniqueCreate.', function (done) {

        database.getSofaInternals(function (err, sofaInternals) {

            var original = sofaInternals.foundation.core.uniqueCreate;

            sofaInternals.foundation.core.uniqueCreate = function (username, type, callback) {

                sofaInternals.foundation.core.uniqueCreate = original;
                return callback(new Error('mock foundation.core.uniqueCreate failure.'), null, null);
            };

            sofaInternals.
                tools.
                    user.
                        generateUniqueValues(
                            internals.mockUser1.username,
                            internals.mockUser1.email,
                            function (err, usernameDocument, useremailDocument) {

                                expect(err).to.equal('couchdb request failed.');
                                done();
                            });
        });
    });

    it('tools.user.generateUniqueValues fail email already exists.', function (done) {

        database.getSofaInternals(function (err, sofaInternals) {

            var original = sofaInternals.tools.user.uniqueUsernameCreate;

            sofaInternals.tools.user.uniqueUsernameCreate = function (username, callback) {

                sofaInternals.tools.user.uniqueUsernameCreate = original;

                // mock no errors.

                return callback(null, 1, 1);
            };

            var original2 = sofaInternals.tools.user.rollbackOne;

            sofaInternals.tools.user.rollbackOne = function (usernameId, callback) {

                sofaInternals.tools.user.rollbackOne = original2;

                return callback(null, 1);
            };

            return sofaInternals.
                tools.
                    user.
                        generateUniqueValues(
                            internals.mockUser1.username,
                            internals.mockUser1.email,
                            function (err, usernameDocument, useremailDocument) {

                                expect(err).to.equal('useremail already exists.');
                                done();
                            });
        });
    });

    it('tools.user.generateUniqueValues fail username rollback failed.', function (done) {

        database.getSofaInternals(function (err, sofaInternals) {

            var original = sofaInternals.tools.user.uniqueUsernameCreate;

            sofaInternals.tools.user.uniqueUsernameCreate = function (username, callback) {

                sofaInternals.tools.user.uniqueUsernameCreate = original;

                return callback(null, 1, 1);
            };

            var original2 = sofaInternals.tools.user.rollbackOne;

            sofaInternals.tools.user.rollbackOne = function (usernameId, callback) {

                sofaInternals.tools.user.rollbackOne = original2;

                return callback(new Error('mock rollback failure.'), 1);
            };

            return sofaInternals.
                tools.
                    user.
                        generateUniqueValues(
                            internals.mockUser1.username,
                            internals.mockUser1.email,
                            function (err, usernameDocument, useremailDocument) {

                                expect(err).to.equal('username rollback failed.');
                                done();
                            });
        });
    });

    it('tools.user.generateUniqueValues success username rollback.', function (done) {

        database.getSofaInternals(function (err, sofaInternals) {

            var original = sofaInternals.tools.user.uniqueUsernameCreate;

            sofaInternals.tools.user.uniqueUsernameCreate = function (username, callback) {

                sofaInternals.tools.user.uniqueUsernameCreate = original;

                return callback(null, 1, 1);
            };

            var original2 = sofaInternals.tools.user.uniqueEmailCreate;

            sofaInternals.tools.user.uniqueEmailCreate = function (emailToCreate, callback) {

                sofaInternals.tools.user.uniqueEmailCreate = original2;

                return callback(new Error('mock unique email failure.'), null, null);
            };

            return sofaInternals.
                tools.
                    user.
                        generateUniqueValues(
                            internals.mockUser1.username,
                            internals.mockUser1.email,
                            function (err, usernameDocument, useremailDocument) {

                                expect(err).to.equal('couchdb request failed.');
                                done();
                            });
        });
    });

    it('tools.user.rollbackUsernameEmail fail to destroy username document.', function (done) {

        database.getSofaInternals(function (err, sofaInternals) {

            sofaInternals.tools.user.rollbackUsernameEmail('mockuid', 'mockemail', function (err, result) {

                expect(err).to.equal('rollback failed.');
                done();
            });
        });
    });

    it('tools.user.rollbackUsernameEmail fail to destroy email document.', function (done) {

        database.getSofaInternals(function (err, sofaInternals) {

            var original = sofaInternals.tools.user.uniqueUsernameDestroy;

            sofaInternals.tools.user.uniqueUsernameDestroy = function (idToDestroy, callback) {

                sofaInternals.tools.user.uniqueUsernameDestroy = original;
                return callback(null, null);

            };

            sofaInternals.tools.user.rollbackUsernameEmail('mockuid', 'mockemail', function (err, result) {

                expect(err).to.equal('rollback failed.');
                done();
            });
        });
    });

    it('tools.user.rollbackOne fail to destroy requested document.', function (done) {

        database.getSofaInternals(function (err, sofaInternals) {

            var original = sofaInternals.foundation.core.uniqueDestroy;

            sofaInternals.foundation.core.uniqueDestroy = function (idToDestroy, callback) {

                sofaInternals.foundation.core.uniqueDestroy = original;
                return callback(new Error('mock uniqueDestroy failure.'), null);

            };

            sofaInternals.tools.user.rollbackOne(1, function (err, result) {

                expect(err).to.equal('rollbackOne failed.');
                done();
            });
        });
    });

    it('tools.user.uniqueEmailUpdate success updated email.', function (done) {

        database.getSofaInternals(function (err, sofaInternals) {

            sofaInternals.tools.user.uniqueEmailUpdate(internals.mockUser1.email, 'sample@boom.com', function (err, newId, newRevId) {

                expect(newId).to.equal('useremail/sample@boom.com');
                done();
            });
        });
    });

    it('tools.user.uniqueEmailUpdate success updated email.', function (done) {

        database.getSofaInternals(function (err, sofaInternals) {

            sofaInternals.tools.user.uniqueEmailUpdate('sample@boom.com', 'useremail/' + internals.mockUser1.email, function (err, newId, newRevId) {

                expect(newId).to.equal('useremail/sofajs@boom.com');
                done();
            });
        });
    });

    it('cleanup revert updated email. tools.user.uniqueEmailUpdate success.', function (done) {

        database.getSofaInternals(function (err, sofaInternals) {

            sofaInternals.tools.user.uniqueEmailUpdate('useremail/' + internals.mockUser1.email, 'sample@boom.com',  function (err, newId, newRevId) {

                expect(newId).to.equal('useremail/' + 'sample@boom.com');
                done();
            });
        });
    });

    it('cleanup step1 tools.user.uniqueEmailUpdate revert fixture data changes.', function (done) {

        database.getSofaInternals(function (err, sofaInternals) {

            sofaInternals.tools.user.uniqueEmailUpdate('sample@boom.com', 'useremail/' + internals.mockUser1.email, function (err, newId, newRevId) {

                expect(newId).to.equal('useremail/sofajs@boom.com');
                done();
            });
        });
    });

    // it('tools.user.generateUniqueValues fail email already exists.', function (done) {

    //     database.getSofaInternals(function (err, sofaInternals) {

    //         // mock uniqueUsernameCreate passing/success.

    //         var original = sofaInternals.tools.user.uniqueUsernameCreate;

    //         sofaInternals.tools.user.uniqueUsernameCreate = function (username, callback) {

    //             sofaInternals.tools.user.uniqueUsernameCreate = original;
    //
    //             // mock no errors.

    //             return callback(null, null, null);
    //         };

    //         return sofaInternals.
    //             tools.
    //                 user.
    //                     generateUniqueValues(
    //                         internals.mockUser1.username,
    //                         internals.mockUser1.email,
    //                         function (err, usernameDocument, useremailDocument) {

    //                             expect(err).to.equal('useremail already exists.');
    //                             done();
    //                         });
    //     });
    // });

    it('cleanup step2', function (done) {

        // database.foundation.core.uniqueDestroy('username/' + internals.mockUser1.username, function (err, result) {
        database.getSofaInternals(function (err, sofaInternals) {

            sofaInternals.tools.user.uniqueUsernameDestroy(internals.mockUser1.username, function (err, result) {

                expect(err).to.equal(null);

                sofaInternals.tools.user.uniqueEmailDestroy(internals.mockUser1.email, function (err, result2) {

                    expect(result2.id).to.equal('useremail/' + internals.mockUser1.email);

                    var splitRevisionId = result2.rev.split('-');
                    expect(splitRevisionId[1]).to.have.length(32);
                    done();
                });
            });
        });
    });
});

describe('tools.user.validateUsername', function () {


    it('tools.user.validateUsername success valid username.', function (done) {

        database.getSofaInternals(function (err, sofaInternals) {

            sofaInternals.tools.user.validateUsername('wakawaka', function (err, username) {

                expect(err).to.equal(null);

                // expect(splitRevisionId[1]).to.have.length(32);
                done();
            });
        });
    });

    it('tools.user.validateUsername fail invalid username.', function (done) {

        database.getSofaInternals(function (err, sofaInternals) {

            sofaInternals.tools.user.validateUsername('wakawa', function (err, username) {

                expect(err).to.exist();
                expect(err).to.equal('Invalid username.');


                done();
            });
        });
    });

    it('tools.user.validateUsername success forbiden characters washed out.', function (done) {

        database.getSofaInternals(function (err, sofaInternals) {

            sofaInternals.tools.user.validateUsername('wa(k)awa>ka', function (err, username) {

                // console.log('tools.validateUsername ' + 'err ' + JSON.stringify(err) + ' username ' + JSON.stringify(username));
                expect(err).to.equal(null);
                expect(username).to.equal('wakawaka');

                done();
            });
        });
    });
});

describe('tools.user.revertLockout', function () {

    it('tools.user.revertLockout mock _design/user update revertLockout failure.', function (done) {

        database.getSofaInternals(function (err, sofaInternals) {

            var original = sofaInternals.db.atomic;

            sofaInternals.db.atomic = function (designName, updateName, docid, key, callback) {

                sofaInternals.db.atomic = original;
                return callback(new Error('mock _design/user update revertLockout function failure.'), null);
            };

            var documentId = 1345;

            sofaInternals.tools.user.revertLockout(documentId, function (err, result) {

                expect(err).to.equal('revertLockout failed.');
                done();
            });
        });
    });
});

internals.mockUser1 = {
    'username': 'uniqueuser',
    'first': 'Sofa',
    'last': 'Js',
    'pw': 'n_c&d8yTT',
    'email': 'sofajs@boom.com',
    'scope': ['user'],
    loginAttempts: 0,
    lockUntil: Date.now() - 60 * 1000,
    created: Date.now()
};

