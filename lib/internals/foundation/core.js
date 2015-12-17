// ./lib/internals/foundation/core.js
// internal foundation functions to be included in all sofajs applications.

var Promise = require('bluebird');
var Hoek = require('hoek');
var Items = require('items');

var internals = {};
var sofaInternals = {};


exports = module.exports = internals.Core = function (sofaInternalsParam) {

    internals.context = this;
    sofaInternals = sofaInternalsParam;

    internals.foundationGroupName = 'core';

    sofaInternals.foundation.register(internals.foundationGroupName)
        .foundation.requests([

            // test

            {
                name: 'test',
                group: internals.foundationGroupName,
                comment: 'test foundation configuration  \n',
                handler: function (callback) {

                    // console.log('YES!! foundation test executed');
                    return callback(null, 'foundation executed');
                }
            },

            // destroy

            {
                name: 'destroy',
                group: internals.foundationGroupName,
                comment: 'destroy document. \n' +
                         'parameters\n' +
                         '* docId _id of document to destroy\n' +
                         '* revId _rev of document to destroy\n' +
                         '* callback(err, result) \n' +
                         '  - err null or \'failed to destroy document.\'\n' +
                         '  - result `{error object here}`\n' +
                         '\n',
                handler: function (docId, revisionId, callback) {

                    // ensure document exists.
                    // otherwise, return error document does not exist to delete.

                    sofaInternals.db.destroy(docId, revisionId, function (err, result) {

                        if (err) {

                            return callback('failed to destroy document.', null);
                        }

                        // console.log('target: ' + result);
                        return callback(null, result);
                    });
                }
            },

            // insertid

            {
                name: 'insertid',
                group: internals.foundationGroupName,
                comment: 'inserts a document with supplied id.',
                handler: function (insertDoc, docId, callback) {

                    var insertDocument = insertDoc;
                    var documentId = docId;

                    return sofaInternals.db.insert(insertDocument, documentId, function (err, body, headers) {

                        if (err) {

                            // throw err;
                            return callback(err, headers);
                            // return reject(err);
                        }

                        // console.log('nano insertid document completed \'headers\': ' +
                        //    JSON.stringify(headers));

                        return callback(null, headers, body);
                    });
                }
            },

            // get

            {
                name: 'get',
                group: internals.foundationGroupName,
                comment: 'get document with docId. \n' +
                         'params is optional.  set to null if not used.' +
                         'Method can also be used to test if the record exists. \n' +
                         'returns **callback(err, body)** \n' +
                         '* if **err** equals \'error message.\'' +
                         '* **body** equals document',
                handler: function (docId, params, callback) {

                    return sofaInternals.db.get(docId, params, function (err, body) {

                        // console.log('get result: ' + JSON.stringify(err) + '' + JSON.stringify(body));

                        if (err) {

                            // throw err;
                            return callback(err, body);
                            // return reject(err);
                        }

                        // console.log('nano insertid document completed \'headers\': ' +
                        //    JSON.stringify(headers));

                        return callback(null, body);
                    });
                }
            },

            // uniqueCreate

            {
                name: 'uniqueCreate',
                group: internals.foundationGroupName,
                comment: 'make new uniqueRecord document. \n' +
                         '* **idToCreate** value may be: \'fooUsername\'. \n' +
                         '* **uniqueRecordType** value may be: \'username\'. \n' +
                         '  - A uuid generated using above two values for: \'idToCreate\' and \'uniqueRecordType\'\n' +
                         '    would be : \'username/fooUsername\'.\n\n' +
                         '* **callback(err, documentId, documentRev)** \n' +
                         '* **err**\n' +
                         '  - null \n' +
                         '  - \'uuid already exists.\' \n' +
                         '  - \'Error: foundation.core.insertid failed.\' \n' +
                         '* **result** on success \n' +
                         '  - **documentId** and **documentRev** \n' +
                         '    equal to newly created document  _id  and _rev. \n' +
                         '\n' +
                         '### Why uniqueRecord documents? \n' +
                         'A uniqueRecord document is required to enforce uniqueness of certain document values. \n' +
                         'In this project\'s case email and username records must be unique. \n' +
                         'Since couchdb only enforces uniqueness of document uuids, \n' +
                         'documents with uuids of \'username\' or \'useremail\' are created for each user record.\n' +
                         'In this project these documents are called uniqueRecord documents. \n' +
                         'The only reason for a uniqueRecord\'s existence is to enforce uniqueness of certain values.\n' +
                         'If an attempt to create duplicate email or usernames occurs the query will fail \n' +
                         'which enforces uniqueness.\n' +
                         '\n',
                handler: function (idToCreate, uniqueRecordType, callback) {

                    // strip prefix if exists.
                    // @todo debug this logic being in foundation.
                    // uniqueDestroy needs complete key to execute.
                    // while uniqueCreate does not want full key. This is the issue.
                    // remove key addition from unique create logic.

                    idToCreate = idToCreate.replace('useremail/', '');
                    idToCreate = idToCreate.replace('username/', '');

                    // console.log('prepped idToCreate ' + idToCreate);

                    return sofaInternals.foundation.core.insertid({ description: 'uniqueRecord document.',
                        type: uniqueRecordType + '/unique',
                        primary_doc: 0 },
                        uniqueRecordType + '/' + idToCreate,
                        function (err, headers, body) {

                            // if documentid exists insert will fail avoiding duplicates.
                            // couchdb's way to ensure uniqueness.

                            if (err) {

                                if (err.message === 'Document update conflict.') {
                                    return callback('uuid already exists.', headers, body);
                                }

                                return callback('Error: foundation.core.insertid failed.', headers, body);
                            }

                            return callback(err, body.id, body.rev);
                        });
                }
            },

            // uniqueDestroy

            {
                name: 'uniqueDestroy',
                group: internals.foundationGroupName,
                comment: 'destroy unique document. \n' +
                         '\n' +
                         '**parameters** \n' +
                         '* **docIdToDestroy** the uuid of the document to destroy.\n' +
                         '* **callback(err, result)** \n' +
                         '  - **err**  \n' +
                         '    * null if no errors.\n' +
                         '    * \'Document does not exist.\' \n' +
                         '    * \'couchdb request failed.\' \n' +
                         '    * \'failed to destroy the record.\' \n' +
                         '  - result \n' +
                         '    `{"ok":true,"id":"xxxx","rev":"x-xxxxx"}`\n' +
                         '    above is result of document just destroyed. \n' +
                         '    note, couchdb puts the document in deleted status, but, technically \n' +
                         '    the record is still there. Insert a new document with the same id and \n' +
                         '    the record will be resurrected with a new revision id.',
                handler: function (docIdToDestroy, callback) {

                    return sofaInternals.db.get(docIdToDestroy, null, function (err, body) {

                        if (err) {

                            // couchdb/nano handles id not exist errors differently with get.
                            // example: if the id existed but is deleted err.message === deleted.

                            if (err.message === 'deleted') {
                                return callback('Document does not exist.', null);
                            } else if (err.message === 'missing') {
                                return callback('Document does not exist.', null);
                            }

                            return callback('couchdb request failed.', null);
                        }

                        // destroy the document

                        return sofaInternals.db.destroy(body._id, body._rev, function (err, result) {

                            if (err) {
                                return callback('failed to destroy the record.', null);
                            }

                            return callback(null, result);
                        });
                    });
                }
            },

            // uniqueGet

            {
                name: 'uniqueGet',
                group: internals.foundationGroupName,
                comment: 'get uniqueRecord document. \n' +
                         'The uniqueRecord document is a record with a document._id equal to the \'uniqueKey\' \n' +
                         'A uniqueKey may be a \'username \' or \'email\'. UniqueKeys are designed and built by the developer. \n' +
                         'and are a couchdb friendly mechanism to enforce unique values. If a project requires validation \n' +
                         'and enforcement of many unique values, couchdb is not the right tool for the job.' +
                         '\n' +
                         'return **callback(err, document)** \n' +
                         '* **err**  \n' +
                         '  - null \n' +
                         '  - \'Username does not exists.\' \n' +
                         '* **document** record with a matching documentId. \n',
                handler: function (documentId, callback) {

                    return sofaInternals.db.get(documentId, function (err, result) {

                        if (err) {

                            return callback('uuid does not exist.', null);
                        }

                        return callback(null, result);
                    });
                }
            },

            // uniqueUpdate

            {
                name: 'uniqueUpdate',
                group: internals.foundationGroupName,
                comment: '\n' +
                         '`data = { idOriginal: idOriginal, idNew: idNew, type: uniqueRecordType };`\n\n' +
                         '* **idOriginal:** original uniqueRecord value to destroy \n' +
                         '* **idNew:** new uniqueRecord value to be created \n' +
                         '* **type:** new type of uniqueRecord. For example, \'username\' or \'useremail\' \n\n' +
                         'Example: \n' +
                         '`data = { idOriginal: \'old@email.com\', idNew: \'new@email.com\', type: \'useremail\' };` \n\n' +
                         'Above would create a document with a uuid of: \'useremail/new@email.com\'\n' +
                         'and destroy the old record with uuid of: \'useremail/old@email.com\'\n\n' +
                         '* **callback(err, newUniqueId, newUniqueIdRev)**\n' +
                         '  - err: \n' +
                         '    * null \n' +
                         '    * \'uuid already exists.\' \n' +
                         '    * \'Error: foundation.core.insertid failed.\' \n' +
                         '    * \'Reverted transaction. uniqueDestroy failed.\' \n' +
                         '  - newUniqueId: uuid of newly created uniqueRecord. \n' +
                         '  - newUniqueIdRev: couchdb gernerated _rev value of newly created uniqueRecord. \n' +
                         '#### process logic\n' +
                         'Check if the new uniqueRecord already exists, if so stop process.  \n' +
                         'if new value (update to value) does not already exist, then create the uniqueRecord.  \n' +
                         'After succesfully creating the new uniqueRecord, destroy old uniqueRecord to.  \n' +
                         'This allows for use of destroyed uniqueRecord value in the future.  \n' +
                         'If destroying old uniqueRecord fails, rollback the whole transaction.  \n' +
                         '\n',
                handler: function (data, callback) {

                    // var data = { idOriginal: idOriginal, idNew: idNew, type: uniqueRecordType };

                    return sofaInternals.foundation.core.uniqueCreate(data.idNew, data.uniqueRecordType, function (err, docId, docRev) {

                        // console.log('target ' + JSON.stringify(err));
                        var newUniqueId = docId;
                        var newUniqueIdRev = docRev;

                        if (err) {
                            // failed to create new unique username.
                            // username already exists or nano failed.
                            return callback(err, null, null);
                        }

                        // successfully made new username record.
                        // destroy old username record.

                        return sofaInternals.foundation.core.uniqueDestroy(data.idOriginal, function (err, result) {

                            if (err) {

                                // cleanup after failed destroy
                                // failed to destroy old uniqueUserId.
                                // revert previous creation of new uniqueUsername.

                                return sofaInternals.foundation.core.uniqueDestroy(newUniqueId,
                                    function (err, result2) {

                                        return callback('Reverted transaction. uniqueDestroy failed.', null, null);

                                    });
                            }

                            // destroyed old username.
                            // return success message.
                            return callback(null, newUniqueId, newUniqueIdRev);
                        });
                    });
                }
            }
        ]);

    return sofaInternals;
};
