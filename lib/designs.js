var Hoek = require('hoek');
var Async = require('async');
var Items = require('items');
var Bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

var internals = {};
var sofaInternals = {};

internals.designDocumentToLoad = {
    language: 'javascript',
    views: null,
    updates: null
};

exports = module.exports = internals.Tools = function (sofaInternalsParam) {

    internals.context = this;
    internals.designName = '';
    sofaInternals = sofaInternalsParam;
    sofaInternals.design = {};
    sofaInternals.designs = {};

    this.designsLoad = function () {

        // loads design functions into db.
        // db should be new or conflicts will exist.
    };

    sofaInternals.design.register = function (designName) {

        console.log('** start register ' + designName);
        Hoek.assert(typeof designName ===  'string' , 'design name ' + designName + ' must be a string.');
        Hoek.assert(sofaInternals.designs[designName] === undefined , 'Design group ' + designName + ' already exists.');
        // console.log('register design: ' + designName);
        internals.designName = designName;

        return sofaInternals;
    };

    sofaInternals.design.views = function (designViewsObject) {

        // Array of _design/xxxxxx views
        // SAMPLE view document
        //{
        //   "_id": "_design/users",
        //   "_rev": "1-8e794d7de0a81f2086735d619a816b80",
        //   "language": "javascript",
        //   "views": {
        //      "list": {
        //          "map": "function (doc) {\n
        //              if(doc.type == 'user') {    \n
        //                  emit(doc._id , { email: doc.email, first: doc.first, last: doc.last, username: doc.username, scope: doc.scope }); \n        }\n    }"
        //              }
        //  }
        //}

        // internals.designDocumentToLoad = {
        //         language: 'javascript',
        //         views: designViewsObject
        //     };

        // console.log('views designViewsObject: ' + Hoek.stringify(designViewsObject));
        // var string = internals.designDocumentToLoad.views.test({username: 'go', first: 'jon', last: 'swenson', email: 'js' });
        // console.log('views '+ length);

        var views = designViewsObject;

        // loop through each design document object.

        var keys = Object.keys(views);

        for (var i = 0; i < keys.length; ++i) {

            // get name of the view function

            // simple validation
            // add comples validation later

            Hoek.assert(views[keys[i]].map, 'document view function does not have map function.');

            // if (views[keys[i]].map) {
            //
            //     console.log('got the map: '+ views[keys[i]].map);
            // }
        };

        // validations passed

        internals.designDocumentToLoad.views =  designViewsObject;

        // load design document
        // asynch will complete after insert is finished

        return sofaInternals;
    };


    sofaInternals.design.updates = function (designUpdatesObject) {

        internals.designDocumentToLoad.updates = designUpdatesObject;
        //console.log('updates ' + Hoek.stringify(designUpdatesObject));
        // console.log('designFunctions ' + JSON.stringify(internals.designDocumentToLoad.updates.testUpdate()));
        // internals.designDocumentToLoad.updates.testUpdate()
        return sofaInternals;
    };

    sofaInternals.design.fixtures = function (fixturesArray) {

        internals.designFixtures = fixturesArray;

        return sofaInternals;
    };

    sofaInternals.design.load = function () {

        // design.load is sensitive to couchdb configurations.
        // if live
        //  * fixtures d/n load
        //  * and designs are updated if they already exist.
        // else
        //  * fixtures load
        //  * and designs are inserted

        // make queries to insert design
        // console.log('loading the design');
        // callback(null, 'boom loadeded');

        Async.waterfall([
            function (next) {

                // load fixuture.
                // if (state live) do not load fixtures else load

                if (sofaInternals.live === true) {

                    // live state do not load fixtures.

                    return next();
                }


                if (internals.designName === 'user') {

                    // fixture is user fixture
                    // hash the password.

                    if (internals.designFixtures !== undefined  && internals.designFixtures.length > 0) {

                        Items.serial(
                                internals.designFixtures,
                                function (item, next) {

                                    sofaInternals.utils.core.hashem(item, next);
                                },
                                function (err) {

                                    // insert fixtures to db

                                    sofaInternals.db.bulk({ docs: internals.designFixtures }, function (err, body, headers) {

                                        if (err) {

                                            console.log('bulkinsert err: ' + err);
                                        }

                                        // promise resolved
                                        console.log('added user fixtures' + body);
                                        return next();
                                    });
                                });
                    } else {

                        console.log('no design fixtures to load.');
                        // no design fixtures to load move on.

                        return next();
                    }


                } else {

                    // not user fixture load it.

                    sofaInternals.db.bulk({ docs: internals.designFixtures }, function (err, body, headers) {

                        if (err) {

                            console.log('bulkinsert err: ' + err);
                        }

                        // promise resolved
                        console.log('added fixtures' + body);
                        return next();
                    });
                }
            },
            function (next) {

                // load design document
                // insertDesign():
                //  - if document exists updates design document do insert new doc.
                //  - if not exists creates new design document.
                //  * below insertDesign addresses this logic.

                internals.context.insertDesign(
                    internals.designDocumentToLoad,
                    '_design/' + internals.designName,
                    function (err, result) {

                        // console.log('created design/document: ' + JSON.stringify(result));
                        next();
                    });
            }], function (err) {

                // test findbyid

                sofaInternals.utils.core.findById('_design/' + internals.designName, function (err, result) {

                    // design loaded

                    console.log('** ' + JSON.stringify(result._id) + ' loaded **');
                    console.log('Design name: ' + internals.designName + ' _designs & fixtures loaded');
                });
            });

    };

    this.loadDesigns = function (callback) {

        // to be loaded seperately from compose().

        if (sofaInternals.manifest.designs.length === 0) {

            return callback(null, 'no designs to load.');
        }

        for (var i = 0; i < sofaInternals.manifest.designs.length; ++i) {

            var designToLoad = sofaInternals.composeOptions.relativeTo + '/' + Object.keys(sofaInternals.manifest.designs[i])[0];

            var designGroup = require(designToLoad);

            // mixin the tool group

            designGroup.call(sofaInternals, sofaInternals);
        };

        return callback(null, 'success: designs loaded');
        // return internals.context;
    };

    return this;
};
