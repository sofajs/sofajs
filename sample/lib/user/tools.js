var Promise = require('bluebird');
var Hoek = require('hoek');
var Bcrypt = require('bcrypt');
var Joi = require('joi');
var SALT_WORK_FACTOR = 10;

var internals = {};
var errors = {};

var sofaInternals = {};

exports = module.exports = function (sofaInternalsParam) {

    sofaInternals = sofaInternalsParam;

    internals.toolGroup = 'user';

    sofaInternals.tool.register(internals.toolGroup)
    .tooldocs(internals.toolGroup,
        'helpers for working with user data')
        .tools([

            // comparePassword

            {
                name: 'comparePassword',
                group: internals.toolGroup,
                comment: ' \n' +
                         'Compares userDocument.pw (bcrypt hashed value) with submittedPassword.\n' +
                         '\n\n' +
                         '* **submittedPassword** pw to be authenticated. \n' +
                         '* **userDocument** userDocument with **pw** key name `document.pw` to be used for authentication. \n' +
                         '* **callback(err, hash)** \n' +
                         '  * **err** may be: \n' +
                         '    - \'null.\' if no errors. \n' +
                         '    - \'Bcrypt failed.\' Signals bcrypt failure. \n' +
                         '    - \'System error bump-loginAttempts failed.\' _design/user update bump-loginAttempts failed. \n' +
                         '    - \'password invalid.\' authentication failed, password do not match. \n' +
                         '  * **userDocument** authentic user\'s JSON document with user account details.',
                handler: function (submittedPassword, userDocument, callback) {

                    return Bcrypt.compare(submittedPassword, userDocument.pw, function (err, res) {

                        if (err) {
                            // console.log('Error found.');
                            return callback('Bcrypt failed.', null);
                        }

                        if (res === true) {

                            // valid password.

                            // revertLockout count.
                            // loginAttempts && lockUntil

                            return callback(null, userDocument);
                        }

                        // invalid password.

                        sofaInternals.db.atomic('user',
                                                'bump-loginAttempts',
                                                userDocument._id,
                                                null, function (err, result) {

                                                    if (err) {
                                                        return callback('System error bump-loginAttempts failed.', null);
                                                    }

                                                    return callback('password invalid.', null);

                                                });
                    });
                }
            },

            // hashem

            {
                name: 'hashem',
                group: internals.toolGroup,
                comment: 'use bcrypt to hash submitted password \n' +
                         'parameters:\n' +
                         '* **password** to be hashed. \n' +
                         '* **callback(err, hash)** \n' +
                         '  * **err** may be: \n' +
                         '    - \'null.\' if no errors. \n' +
                         '    - \'failed to generate salt.\' \n' +
                         '    - \'failed to generate the hash.\' \n' +
                         '  * **hash** equals hash of submitted password.',
                handler: function (password, callback) {

                    return Bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {

                        if (err) {
                            errors.bcrypt.genSaltFailed.bcryptMessage = err;
                            return callback('failed to generate salt.', null);
                        }

                        return Bcrypt.hash(password, salt, function (err, hash) {

                            if (err) {
                                errors.bcrypt.hashFailed.bcryptMessage = err;
                                return callback('failed to generate the hash.', null);
                            }

                            // return hashed pw

                            return callback(null, hash);
                        });
                    });
                }
            },

            // generateUniqueValues

            {
                name: 'generateUniqueValues',
                group: internals.toolGroup,
                comment: 'generate unique \'**username**\' and \'**email**\'. \n' +
                         '\n' +
                         'return **callback(err, usernameDetails, userEmail)** \n' +
                         '* **err**  \n' +
                         '  - null if no errors. \n' +
                         '  - \'username already exists.\'  \n' +
                         '  - \'username rollback failed.\' \n' +
                         '  - \'useremail already exists.\'  \n' +
                         '  - \'couchdb request failed.\'  \n' +
                         '* **result** on success \n' +
                         '  - usernameDetails equals: `{ id: docId, rev: docRev};` \n' +
                         '  - useremailDetails equals: `{ id: docId, rev: docRev};` \n',
                handler: function (username, email, callback) {

                    // var data = { idOriginal: usernameOriginal, idNew: usernameNew, uniqueRecordType: 'username' };

                    return sofaInternals.tools.user.uniqueUsernameCreate(username, function (err, docId, docRev) {

                        if (err) {

                            if (err === 'uuid already exists.') {
                                return callback('username already exists.', null, null);
                            }

                            return callback('couchdb request failed.', null, null);
                        }

                        var usernameConfirmation = { id: docId, rev: docRev };

                        return sofaInternals.tools.user.uniqueEmailCreate(email, function (err, emailDocId, emailDocRev) {

                            if (err) {

                                if (err === 'uuid already exists.') {

                                    return sofaInternals.tools.user.rollbackOne(usernameConfirmation.id, function (err, result) {

                                        if (err) {

                                            // username to be rolled back because email is not unique.
                                            // Howeve, rollback queried failed b/c of technical issue.
                                            return callback('username rollback failed.', null, null);
                                        }

                                        return callback('useremail already exists.', null, null);
                                    });
                                }

                                return callback('couchdb request failed.', null, null);
                            }

                            var emailConfirmation = { id: emailDocId, rev: emailDocRev };

                            return callback(null, usernameConfirmation, emailConfirmation);
                        });
                    });
                }
            },

            // revertLockout

            {
                name: 'revertLockout',
                group: internals.toolGroup,
                comment: 'Ten attempts to login using a specific username resulted in failure. \n' +
                         'Hence, username account was blacklisted. \n' +
                         'The username is black listed for twenty four hours in resistance to a brute\n' +
                         'force attack. Afte twenty four hours, the user record is removed from the blacklist \n' +
                         'using this function. \n' +
                         '**parameters**\n' +
                         '\n' +
                         '* **documentId** of record to remove from blacklist.\n' +
                         '* **callback(err, result)**\n' +
                         '  * err\n' +
                         '    - null or\n' +
                         '    - \'revertLockout failed.\'\n' +
                         '  * result\n' +
                         '    - true if revert succeeded. ',

                handler: function (documentId, callback) {

                    sofaInternals.db.atomic('user', 'revertLockout', documentId, null, function (err, result) {

                        if (err) {
                            // console.log('bump-loginAttempts failed: ' + JSON.stringify(err));
                            return callback('revertLockout failed.', null);
                        }

                        // result = 'revertLockout succeeded.'

                        return callback(null, result);

                    });
                }
            },

            // rollbackOne

            {
                name: 'rollbackOne',
                group: internals.toolGroup,
                comment: 'rollback unique values for \'**username**\', \'**email**\' \n' +
                         'or other unique values if needed. \n' +
                         'Example use: cleanup unique username and email records when requests.user.create fails.\n' +
                         '\n' +
                         '* idToDestroy \n' +
                         '* callback(err, result)\n' +
                         '  * err\n' +
                         '    - null or\n' +
                         '    - \'rollbackOne failed.\'\n' +
                         '  * result\n' +
                         '    - @todo test and write example. ',

                handler: function (idToDestroy, callback) {

                    return sofaInternals.foundation.core.uniqueDestroy(idToDestroy, function (err, result) {

                        if (err) {
                            return callback('rollbackOne failed.');
                        }

                        // console.log('rollback result ' + JSON.stringify(result));
                        callback(null, result);
                    });

                }
            },

            // rollbackUsernameEmail

            {
                name: 'rollbackUsernameEmail',
                group: internals.toolGroup,
                comment: 'rollback uniqueRecord values for \'**username**\' and \'**email**\' \n' +
                         'may be used for other uniqueRecords values too. \n' +
                         'Example use: cleanup unique username and email records when requests.user.create fails.\n' +
                         'Or, destroy username and email records when requests.user.destroy executes.\n' +
                         'parameters\n' +
                         '* usernameId ex) \'username/sampleUsername\' \n' +
                         '* emailId ex) \'useremail/mock1@mock.com\' \n' +
                         '\n' +
                         '* callback(err, result1, result2)\n' +
                         '  - err null or \'rollback failed.\'\n' +
                         '  - on success: \n' +
                         '  - result1 `{"ok":true,"id":"xxxx","rev":"x-xxxxx"}`\n' +
                         '  - result2 `{"ok":true,"id":"xxxx","rev":"x-xxxxx"}`\n' +
                         '  - \'rollback failed.\' upon failure inside this function.\n',

                handler: function (userId, emailId, callback) {

                    // if prefix is on userId or emailId strip the prefix.

                    var usernameId = userId.replace('username/', '');
                    var eId = emailId.replace('useremail/', '');

                    // console.log('split uid: ' + JSON.stringify(usernameId));
                    // console.log('split eid: ' + JSON.stringify(eId));

                    return sofaInternals.tools.user.uniqueUsernameDestroy(usernameId, function (err, result1) {

                        if (err) {
                            return callback('rollback failed.');
                        }

                        return sofaInternals.tools.user.uniqueEmailDestroy(eId, function (err, result2) {

                            if (err) {
                                return callback('rollback failed.');
                            }

                            callback(null, result1, result2);
                        });
                    });

                }
            },

            // validateUser

            {
                name: 'validateUser',
                group: internals.toolGroup,
                comment: 'uses [Joi](https://github.com/hapijs/joi) to validate submitted data. \n' +
                '#### returns callback(err, value) \n' +
                ' * err equals null or Joi.validate error message. \n' +
                ' * value equals object which was validated. ',
                handler: function (userDocToValidate, callback) {

                    return Joi.validate(userDocToValidate, internals.userSchema, function (err, value) {

                        // err is Joi.validation error message.
                        // value is document being validated.

                        return callback(err, value);

                    });
                }
            },

            // validateUsername

            {
                name: 'validateUsername',
                group: internals.toolGroup,
                comment: 'validate submitted username. \n' +
                '### parameters  \n' +
                '* **username** to be created.' +
                '* **callback(err, value)** ' +
                '  - err \n' +
                '    * null \n' +
                '    * \'Invalid username.\' \n' +
                '  - **value** contains valid username. ',
                handler: function (username, callback) {

                    return Joi.validate(username, internals.usernameSchema, function (err, value) {

                        if (err) {
                            return callback('Invalid username.', null);
                        }

                        // err is Joi.validation error message.
                        // value is document being validated.

                        return callback(err, value);

                    });
                }
            },

            // validatePassword

            {
                name: 'validatePassword',
                group: internals.toolGroup,
                comment: 'uses [Joi](https://github.com/hapijs/joi) to validate the password. \n' +
                '#### returns callback(err, result) \n' +
                ' * err equals null or error message. \n' +
                ' * **result** equals **true** or **false**. ',
                handler: function (passwordToValidate, callback) {

                    // var specialCharsRegex = /(.*)([~`!@#$%^&*()\-_+={}\]\[|\\:;"'<>\.,?\/])(.*)([~`!@#$%^&*()\-_+={}\]\[|\\:;"'<>\.,?\/])(.*)([~`!@#$%^&*()\-_+={}\]\[|\\:;"'<>\.,?\/])/;

                    // require
                    // four lowercase
                    // three uppercase
                    // three special chars


                    return Joi.validate(passwordToValidate, internals.passwordSchema, function (err, value) {

                        if (err) {

                            // err is Joi.validation error message.
                            // parse error message

                            if (err.details[0].message.search(/LOWERCASE/) !== -1) {
                                return callback('lowercase letters not valid', false);
                            } else if (err.details[0].message.search(/UPPERCASE/) !== -1) {
                                return callback('uppercase letters not valid', false);
                            } else if (err.details[0].message.search(/SPECIAL_CHARS/) !== -1) {
                                return callback('special characters not valid', false);
                            } else if (err.details[0].message.search(/DIGITS/) !== -1) {
                                return callback('digits not valid', false);
                            }

                            return callback(err, false);
                        }

                        // console.log('validatePassword internal ' + JSON.stringify(err)  + '--'  + JSON.stringify(value));
                        return callback(err, true);
                    });
                }
            },


            // uniqueUsernameCreate

            {
                name: 'uniqueUsernameCreate',
                group: internals.toolGroup,
                comment: 'make new uniqueRecord document. \n' +
                         '### Why uniqueRecord documents? \n' +
                         'A uniqueRecord document is required to enforce uniqueness of certain user document values. \n' +
                         'In this project\'s case email and username records must be unique. \n' +
                         'Since couchdb only enforces uniqueness of document uuids, \n' +
                         'we make documents with uuids of \'usernames\' or \'emails\' for each user record.\n' +
                         'In this project these documents are called uniqueRecord documents. \n' +
                         'The only reasone for a uniqueRecord\'s existence is to enforce uniqueness of values.\n' +
                         'If an attempt to create duplicate email or usernames occurs the query will fail \n' +
                         'which enforces uniqueness.\n' +
                         '\n' +
                         'return **callback(err, document.id, document.rev)** \n' +
                         '* **err**  null or if error returns **\'uuid already exists.\'**  \n' +
                         '* **result** on success returns **document.id** and **document.rev** \n' +
                         '  equal to newly created document  _id  and _rev. ',
                handler: function (usernameToCreate, callback) {

                    return sofaInternals.foundation.core.uniqueCreate(usernameToCreate, 'username', callback);
                }
            },

            // uniqueUsernameDestroy

            {
                name: 'uniqueUsernameDestroy',
                group: internals.toolGroup,
                comment: 'get rid of uniqueUsername document. \n' +
                         'This function alias for uniqueDestroy. \n' +
                         '\n' +
                         'parameters\n' +
                         '* usernameToDestroy equals username without the \'username/\' prefix.\n' +
                         '  function will add \'username/\' prefix for you. \n' +
                         'return **callback(err, result)** \n' +
                         '* **err** \n' +
                         '  - null \n' +
                         '  - \'Document does not exist.\' \n' +
                         '  - \'couchdb request failed.\' \n' +
                         '  - \'failed to destroy the record.\' \n' +
                         '* **result** on success returns **result** \n' +
                         '  - **`{"ok":true,"id":"xxxx","rev":"x-xxxxx"}`** the destroyed document\'s details. \n' +
                         '    note, couchdb puts the document in deleted status, but, technically \n' +
                         '    the record is still there. Insert a new document with the same id and \n' +
                         '    the record will be resurrected.',
                handler: function (usernameToDestroy, callback) {

                    return sofaInternals.foundation.core.uniqueDestroy('username/' + usernameToDestroy, callback);
                }
            },


            // uniqueUsernameUpdate

            {
                name: 'uniqueUsernameUpdate',
                group: internals.toolGroup,
                comment: 'update the uniqueUsername of a user. \n' +
                         'user decided to change usernames. \n' +
                         'and create a new userUsername record. \n' +
                         'upon success change destroy the old uniqueUsername record \n' +
                         '\n' +
                         'return **callback(err, newUniqueId, newUniqueIdRev)** \n' +
                         '* **err**  \n' +
                         '  - null if no errors. \n' +
                         '  - err exists returns **\'Reverted transaction. uniqueDestroy failed.\'**  \n' +
                         '* **newUniqueId** on success \n' +
                         '* **newUniqueIdRev** on success \n' +
                         '\n',
                handler: function (usernameOriginal, usernameNew, callback) {

                    var usernameKey = /^username\//;

                    var originalTest = usernameOriginal.search(usernameKey);
                    var newUsernameTest = usernameNew.search(usernameKey);

                    if (originalTest === -1) {
                        usernameOriginal = 'username/' + usernameOriginal;
                    }

                    if (newUsernameTest === -1) {
                        usernameNew = 'username/' + usernameNew;
                    }

                    // console.log('BEFORE username ' + usernameNew);
                    var data = { idOriginal: usernameOriginal, idNew: usernameNew, uniqueRecordType: 'username' };

                    return sofaInternals.foundation.core.uniqueUpdate(data, callback);
                }
            },

            // uniqueEmailCreate

            {
                name: 'uniqueEmailCreate',
                group: internals.toolGroup,
                comment: 'make new uniqueRecord document. \n' +
                         '### Why uniqueRecord documents? \n' +
                         'A uniqueRecord document is required to enforce uniqueness of certain user document values. \n' +
                         'In this project\'s case email and username records must be unique. \n' +
                         'Since couchdb only enforces uniqueness of document uuids, \n' +
                         'we make documents with uuids of \'usernames\' or \'emails\' for each user record.\n' +
                         'In this project these documents are called uniqueRecord documents. \n' +
                         'The only reasone for a uniqueRecord\'s existence is to enforce uniqueness of values.\n' +
                         'If an attempt to create duplicate email or usernames occurs the query will fail \n' +
                         'which enforces uniqueness.\n' +
                         '\n' +
                         'return **callback(err, documentId, documentRev)** \n' +
                         '* **err**  null or if error returns **\'uuid already exists.\'**  \n' +
                         '* on success returns \n' +
                         '  - **documentId** \n' +
                         '  - **documentRev** \n' +
                         '  equal to newly created document  _id  and _rev. ',
                handler: function (emailToCreate, callback) {

                    return sofaInternals.foundation.core.uniqueCreate(emailToCreate, 'useremail', callback);
                }
            },

            // uniqueEmailDestroy

            {
                name: 'uniqueEmailDestroy',
                group: internals.toolGroup,
                comment: 'get rid of uniqueEmail document. \n' +
                         'This function is an alias for uniqueDestroy. \n' +
                         '\n' +
                         'parameters\n' +
                         '* emailToDestroy equals email without the \'email/\' prefix.\n' +
                         '  function will add \'email/\' prefix for you. \n' +
                         'return **callback(err, result)** \n' +
                         '* **err** \n' +
                         '  - null \n' +
                         '  - \'Document does not exist.\' \n' +
                         '  - \'couchdb request failed.\' \n' +
                         '  - \'failed to destroy the record.\' \n' +
                         '* **result** on success returns **result** \n' +
                         '  - **`{"ok":true,"id":"xxxx","rev":"x-xxxxx"}`** the destroyed document\'s details. \n' +
                         '    note, couchdb puts the document in deleted status, but, technically \n' +
                         '    the record is still there. Insert a new document with the same id and \n' +
                         '    the record will be resurrected.',
                handler: function (emailToDestroy, callback) {

                    return sofaInternals.foundation.core.uniqueDestroy('useremail/' + emailToDestroy, callback);
                }
            },


            // uniqueEmailUpdate

            {
                name: 'uniqueEmailUpdate',
                group: internals.toolGroup,
                comment: 'update the email of a user. \n' +
                         'user decided to change email. \n' +
                         'and create a new email record. \n' +
                         'upon success change destroy the old uniqueEmail record \n' +
                         '\n' +
                         '**callback(err, newUniqueId, newUniqueIdRev)** \n' +
                         '  * **err**  \n' +
                         '    - null if no errors. \n' +
                         '    - err exists returns **\'Reverted transaction. uniqueDestroy failed.\'**  \n' +
                         '  * **newUniqueId** on success \n' +
                         '  * **newUniqueIdRev** on success \n' +
                         '\n',
                handler: function (emailOriginal, emailNew, callback) {

                    var emailKey = /^useremail\//;

                    var originalTest = emailOriginal.search(emailKey);
                    var newEmailTest = emailNew.search(emailKey);

                    if (originalTest === -1) {
                        emailOriginal = 'useremail/' + emailOriginal;
                    }

                    if (newEmailTest === -1) {
                        emailNew = 'useremail/' + emailNew;
                    }

                    var data = { idOriginal: emailOriginal, idNew: emailNew, uniqueRecordType: 'useremail' };

                    return sofaInternals.foundation.core.uniqueUpdate(data, callback);
                }
            }

        ]);

    return sofaInternals;
};

errors = {
    bcrypt: {
        genSaltFailed: {
            message: 'Bcrypt.genSalt() failed to generate salt.',
            bcryptMessage: ''
        },
        hashFailed: {
            message: 'Bcrypt.hash() failed to generate the hash.',
            bcryptMessage: ''
        }
    }
};

internals.specialCharsRegex = /(.*)([~`!@#$%^&*()\-_+={}\]\[|\\:;"'<>\.,?\/])(.*)([~`!@#$%^&*()\-_+={}\]\[|\\:;"'<>\.,?\/])/;

internals.passwordSchema = Joi.string()
    .min(3).max(64).required()
    .regex(/([a-z])(.*)([a-z])(.*)([a-z])/, 'LOWERCASE')
    .regex(/([A-Z])(.*)([A-Z])/, 'UPPERCASE')
    .regex(/(\d)(.*)(\d)(.*)/, 'DIGITS')
    .regex(internals.specialCharsRegex, 'SPECIAL_CHARS');

// started off with really strict schema
// it was unreasonable so simplified to above schema.

internals.specialCharsRegexStrict = /(.*)([~`!@#$%^&*()\-_+={}\]\[|\\:;"'<>\.,?\/])(.*)([~`!@#$%^&*()\-_+={}\]\[|\\:;"'<>\.,?\/])(.*)([~`!@#$%^&*()\-_+={}\]\[|\\:;"'<>\.,?\/])/;

internals.passwordSchemaStrict = Joi.string()
    .min(3).max(64).required()
    .regex(/([a-z])(.*)([a-z])(.*)([a-z])(.*)([a-z])/, 'LOWERCASE')
    .regex(/([A-Z])(.*)([A-Z])(.*)([A-Z])/, 'UPPERCASE')
    .regex(/(\d)(.*)(\d)(.*)(\d)/, 'DIGITS')
    .regex(internals.specialCharsRegexStrict, 'SPECIAL_CHARS');

internals.usernameBlacklist = /[><(\)]/gi;

internals.usernameSchema = Joi.string().min(8).max(70)
                                .required().
                                    replace(internals.usernameBlacklist, '');

internals.userSchema = Joi.object({ // schema required for creating a new user.
    _id: Joi.string(),
    _rev: Joi.string(),
    username: internals.usernameSchema,
    // pw: Joi.string().min(3).max(64).required(),  // length long for bcrypt
    pw: internals.passwordSchema,
    email: Joi.string().email().required(),
    first: Joi.string().min(1).max(50).required(),
    last: Joi.string().min(1).max(50).required(1),
    scope: Joi.array().items(Joi.string().valid('admin', 'user').required()),
    loginAttempts: Joi.number().greater(-1).default(0, 'monitor failed attempts').required(),
    lockUntil: Joi.date().default(Date.now - 60 * 1000, 'set to expired time.').required(),
    created: Joi.date().required()
});
