// user/requests.js

var Bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

var internals = {};
var errors = {};
var sofaInternals = {};

exports = module.exports = internals.User = function (sofaInternalsParam) {

    internals.context = this;
    sofaInternals = sofaInternalsParam;

    internals.requestGroupName = 'user';

    sofaInternals.request.register(internals.requestGroupName)
        .requests([

            // authenticate

            {
                name: 'authenticate',
                group: internals.requestGroupName,
                comment: 'authenticate user attempting to login. \n' +
                         '### parameters \n' +
                         '* **email** \n' +
                         '* **password** \n' +
                         '* **callback(err, result)** \n' +
                         '  - **err**\n' +
                         '    * null on success.\n' +
                         '    * \'system error findByEmail failed.\'\n' +
                         '    * \'user email does not exist.\'\n' +
                         '    * \'password invalid.\'\n' +
                         '    * \'user blacklisted.\'\n' +
                         '  - **result** on success equals userdocument.\n' +
                         '\n' +
                         '### lockout system \n' +
                         '*  loginAttempts tracks attempted logins.\n' +
                         '   -  ten failed attempts is lockout limit.\n' +
                         '*  lockUntil\n' +
                         '   - duration is twenty four hours.\n' +
                         '*  bump-loginAttempts `./lib/user/design.js`\n' +
                         '   -  is _design/user updates function. \n' +
                         '   -  manages login attempts accounting \n' +
                         '   -  and initiates lock out on ten failed attempts. \n' +
                         '*  revertLockout `./lib/user/design.js`\n' +
                         '   -  is _design/user updates function. \n' +
                         '   -  resets lock out system when lockout expires. \n' +
                         '\n',
                handler: function (email, password, callback) {

                    sofaInternals.requests.user.findByEmail(email, function (err, userDocument) {

                        if (err) {
                            return callback('system error findByEmail failed.', null);
                        } else if (userDocument === 0) {
                            // email does not exist.
                            return callback('user email does not exist.', null);
                        }

                        // lockoutExpired
                        // checkpassword if success revertLockout otherwise wait.
                        // if password fails.

                        if (internals.lockOutExpired(userDocument)) {

                            return sofaInternals.tools.user.revertLockout(userDocument._id, function (err, result) {

                                // return internals.comparePassword(password, userDocument, function (err2, result2) {
                                return sofaInternals.tools.user.comparePassword(password, userDocument, function (err2, result2) {

                                    if (err2) {
                                        // generic error response below.
                                        // @todo plan out how detailed errors should be here.
                                        return callback('password invalid.', null);
                                    }

                                    return callback(null, result2);
                                });
                            });
                        }

                        // lockedOut

                        if (internals.userLockedOut(userDocument)) {
                            return callback('user blacklisted.', null);
                        }

                        // authenticate password.

                        // return internals.comparePassword(password, userDocument, function (err, result) {
                        return sofaInternals.tools.user.comparePassword(password, userDocument, function (err, result) {

                            if (err) {
                                return callback('password invalid.', null);
                            }

                            // console.log('target: ' + JSON.stringify(result));
                            return callback(null, result);
                        });
                    });
                }
            },

            // create

            {
                name: 'create',
                group: internals.requestGroupName,
                comment: 'create user document if valid. \n' +
                         'parameters \n' +
                         '* **userdoc** is user document to be created. \n' +
                         '* **callback(err, newUserDocument)** \n'  +
                         '  - err equals \n' +
                         '    * \'user data invalid.\'\n' +
                         '    * \'username already exists.\'\n' +
                         '    * \'useremail already exists.\'\n' +
                         '    * \'couchdb request failed.\'\n' +
                         '    * \'failed to generate salt.\'\n' +
                         '    * \'failed to generate hash.\'\n' +
                         '    * \'nano failed to insert user document.\' \n' +
                         '  - newUserDocument \n' +
                         '    on success returns details of created document.\n' +
                         '    `{"ok":true,"id":"xxxxx","rev":"1-xxxxx"}`',
                handler: function (userdoc, callback) {

                    sofaInternals.tools.user.validateUser(userdoc, function (err, validUserDocument) {

                        if (err) {
                            return callback('user data invalid.', validUserDocument);
                        }

                        sofaInternals.tools.user.generateUniqueValues(userdoc.username, userdoc.email, function (err, username, email) {

                            // console.log('generateUniqueValues err:' + JSON.stringify(err));
                            if (err) {
                                // err message options:
                                // 'username already exists.'
                                // 'useremail already exists.'
                                // 'couchdb request failed.'

                                return callback(err, null);
                            }

                            // generated unique username and useremail.

                            return sofaInternals.tools.user.hashem(userdoc.pw, function (err, hash) {

                                if (err) {

                                    var error = err;

                                    return sofaInternals.tools.user.rollbackUsernameEmail(
                                        username.id,
                                        email.id,
                                        function (err, result1, result2) {

                                            if (err) {
                                                // return callback('rollback failed.', null);
                                                return callback('rollback failed.', null);
                                            }

                                            return callback(error, null);
                                        });
                                }

                                userdoc.pw = hash;

                                // validations passed, create new record.

                                return sofaInternals.db.insert(userdoc, function (err, body) {

                                    if (err) {

                                        // return callback('nano failed to insert user document.', null);
                                        return sofaInternals.tools.user.rollbackUsernameEmail(
                                            username.id,
                                            email.id,
                                            function (err, result1, result2) {

                                                if (err) {
                                                    // return callback('rollback failed.', null);
                                                    return callback('rollback failed.', null);
                                                }

                                                return callback('rolledback unique user data because nano insert failed.', null);
                                            });
                                    }

                                    return callback(null, body);
                                });
                            });
                        });
                    });
                }
            },

            // destroy

            {
                name: 'destroy',
                group: internals.requestGroupName,
                comment: 'destroy user document. \n' +
                         'parameters\n' +
                         '* userdocId id of document to destroy. \n' +
                         '* callback(err, result) \n' +
                         '  - err null or \n' +
                         '    * \'destroy request failed.\'\n' +
                         '    * \'failed to destroy unique records.\' \n' +
                         '    * \'document to be destroyed does not exist.\'\n' +
                         '    * \'couchdb destroy request failed.\'\n' +
                         '  - result `{"ok":true,"id":"xxxxxx","rev":"2-xxxx"}`\n' +
                         '  result ids of destroyed document.',

                handler: function (userdocId, callback) {

                    return sofaInternals.foundation.core.get(userdocId, function (err, result) {

                        if (err) {
                            return callback('document to be destroyed does not exist.', null);
                        }

                        return sofaInternals.tools.user.rollbackUsernameEmail(
                            'username/' + result.username,
                            'useremail/' + result.email,
                            function (err, result1, result2) {

                                if (err) {
                                    return callback('failed to destroy unique records.');
                                }

                                // console.log('rollback results err: ' +  err +  '\n' +
                                //             ' result1 ' + JSON.stringify(result1) + '\n' +
                                //             ' result2 ' + JSON.stringify(result2));

                                return sofaInternals.db.destroy(result._id, result._rev, function (err, result3) {

                                    // console.log('**destroy** ' + JSON.stringify(result));

                                    if (err) {
                                        return callback('couchdb destroy request failed.', null);
                                    }

                                    return callback(null, result3);
                                });
                            });
                    });
                }
            },

            // findByUsername

            {
                name: 'findByUsername',
                group: internals.requestGroupName,
                comment: 'search for user record with value equal to username. \n' +
                         'Utilizes view \'findByUsername\' to search user documents for match. \n' +
                         'uniqueRecords with uuid are not searched. For more on uniqueRecords\n' +
                         'see explanation of [unique usernames](#tools-user-uniqueUsernameCreate). \n' +
                         '#### parameters: \n' +
                         '* **username** \n' +
                         '  username name to search for in db.\n' +
                         '* **callback(err, record)** \n' +
                         '  - **err**\n' +
                         '    * **null** if match is found. \n' +
                         '    * \'findByUsername view query failed.\' \n' +
                         '    * \'Result not unique.\' \n' +
                         '      This is a check in case someone writes a function that inserts \n' +
                         '      users bypassing uniqueness checks.\n' +
                         '    * **result** \n' +
                         '      - **0** if no match is found. \n' +
                         '      - { userdocument } \n' +
                         '\n',
                handler: function (username, callback) {

                    sofaInternals.db.view('user', 'findByUsername', { keys: [username] }, function (err, result) {

                        if (err) {
                            return callback('findByUsername view query failed.', null);
                        }

                        if (result.rows.length === 0) {
                            // console.log('tools.user.findByUsername no records found.');
                            return callback(null, 0);
                        } else if (result.rows.length > 1) {
                            return callback('Result not unique.', null);
                        }

                        return callback(null, result.rows[0].value);
                    });
                }
            },

            // findByEmail

            {
                name: 'findByEmail',
                group: internals.requestGroupName,
                comment: 'search for user record with email. \n' +
                         '#### parameters \n' +
                         '* **email** \n' +
                         '  email to find in the database. \n' +
                         '* **callback(err, result)** \n' +
                         '  - err \n' +
                         '    * null  \n' +
                         '    * \'findByEmail view query failed.\'  \n' +
                         '  - result \n' +
                         '    * user document object. \n' +
                         '\n',
                handler: function (email, callback) {

                    sofaInternals.db.view('user', 'findByEmail', { keys: [email] }, function (err, result) {

                        if (err) {
                            return callback('findByEmail view query failed.', null);
                        }

                        if (result.rows.length === 0) {
                            // console.log('tools.user.findByUsername no records found.');
                            return callback(null, 0);
                        } else if (result.rows.length > 1) {
                            return callback('Result not unique.', null);
                        }

                        return callback(null, result.rows[0].value);

                        // return callback(null, result);
                    });
                }
            },

            // updateEmail

            {
                name: 'updateEmail',
                group: internals.requestGroupName,
                comment: 'update email. \n' +
                         'system requires emails to be unique. \n',
                handler: function (docid, oldEmail, newEmail, callback) {

                    sofaInternals.tools.user.uniqueEmailUpdate(oldEmail, newEmail, function (err, newUniqueId, newIdRev) {

                        if (err) {
                            return callback('uniqueEmailUpdate failed.', null);
                        }

                        // uniqueRecord doc updated, now, update the user document.

                        sofaInternals.db.atomic('user', 'email', docid, { email: newEmail }, function (err, result) {

                            if (err) {

                                // rollback email uniqueRecord changes.

                                return sofaInternals.
                                    tools.
                                        user.
                                            uniqueEmailUpdate(
                                                newUniqueId,
                                                oldEmail,
                                                function (err, newuid, newuidRev) {

                                                    // @todo build coverage for this.
                                                    // if (err) {
                                                    //     // serious issues if this happens.
                                                    //     return callback('uniqueEmailUpdate rollback failed.', null);
                                                    // }

                                                    return callback('user.email update function failed.', null);
                                                });

                            }

                            return callback(null, result);
                        });
                    });
                }
            },

            // updatePassword

            {
                name: 'updatePassword',
                group: internals.requestGroupName,
                comment: 'update password. \n' +
                         'parameters \n' +
                         '* **docId** uuid of document to update passord in.\n' +
                         '* **newPassword** new password to update to.\n' +
                         '* **callback(err, result)**\n' +
                         '  - **err** \n' +
                         '    * null\n' +
                         '    * \'Invalid password.\'\n' +
                         '    * \'Hash of new password failed.\'\n' +
                         '    * \'User design update password failed.\'\n' +
                         '  - **result** \n' +
                         '    * \'Updated password.\'\n' +
                         '\n',
                handler: function (docid, newPassword, callback) {

                    // validate pw.

                    sofaInternals.tools.user.validatePassword(newPassword, function (err, result) {

                        if (err) {
                            return callback('Invalid password.', null);
                        }

                        // hash newPassword.

                        sofaInternals.tools.user.hashem(newPassword, function (err, hash) {

                            if (err) {
                                return callback('Hash of new password failed.', null);
                            }

                            // store the new hashed password.

                            return sofaInternals.db.atomic('user', 'password', docid, { password: hash }, function (err2, result2) {

                                if (err2) {
                                    return callback('User design update password failed.', null);
                                }

                                return callback(null, result2);
                            });
                        });
                    });
                }
            },

            // updateUsername

            {
                name: 'updateUsername',
                group: internals.requestGroupName,
                comment: 'update username. \n' +
                         'system requires emails to be unique. \n',
                handler: function (docid, oldUsername, newUsername, callback) {

                    sofaInternals.tools.user.uniqueUsernameUpdate(oldUsername, newUsername, function (err, newUniqueId, newIdRev) {

                        if (err) {
                            return callback('uniqueUsernameUpdate failed.', null);
                        }

                        // uniqueRecord doc updated, now, update the user document.

                        sofaInternals.db.atomic('user', 'username', docid, { username: newUsername }, function (err, result) {

                            if (err) {

                                // rollback email uniqueRecord changes.

                                return sofaInternals.
                                    tools.
                                        user.
                                            uniqueUsernameUpdate(
                                                newUniqueId,
                                                oldUsername,
                                                function (err, newuid, newuidRev) {

                                                    // @todo build coverage for this.
                                                    // if (err) {
                                                    //     // serious issues if this happens.
                                                    //     return callback('uniqueEmailUpdate rollback failed.', null);
                                                    // }

                                                    return callback('user.username update function failed.', null);
                                                });

                            }

                            return callback(null, result);
                        });
                    });
                }
            }
        ]);
};


errors = {
    validateUserFailed: {
        description: 'joi user validation failed',
        joiMessage: ''
    },
    hashemFailed: {
        description: 'hashem failed because of bcrypt issues.',
        hashemMessage: ''
    },
    nanoInsertFailed: {
        description: 'nano failed to insert user document.',
        nanoMessage: ''
    },
    destroyFailed: {
        description: 'nano failed to destroy the document.',
        nanoMessage: ''
    },
    findByIdFailed: {
        description: 'view.findById failed.',
        nanoMessage: ''
    },
    emailExistsFailed: {
        description: 'emailExistsFailed() nano.view.findByEmail failed.',
        nanoMessage: ''
    },
    emailUpdateFailed: {
        description: 'emailUpdateFailed() nano.atomic.update failed.',
        nanoMessage: ''
    },
    usernameExistsFailed: {
        description: 'usernameExistsFailed() nano.view.findByUsername failed.',
        nanoMessage: ''
    }
};

internals.userLockedOut = function (userDocument) {

    // console.log('userLockedOut document ' + JSON.stringify(userDocument));

    if (userDocument.lockUntil > Date.now()) {
        return true;
    }

    return false;
};

internals.lockOutExpired = function (userDocument) {

    // console.log('userLockedOut document ' + JSON.stringify(userDocument));

    if ((userDocument.loginAttempts >= 10) && (userDocument.lockUntil < Date.now())) {
        return true;
    }

    return false;
};
