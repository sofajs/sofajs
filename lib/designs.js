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
    updates: null,
    filters: null
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

    sofaInternals.design.filters = function (designFiltersObject) {

        internals.designDocumentToLoad.filters = designFiltersObject;
        //console.log('updates ' + Hoek.stringify(designUpdatesObject));
        // console.log('designFunctions ' + JSON.stringify(internals.designDocumentToLoad.updates.testUpdate()));
        // internals.designDocumentToLoad.updates.testUpdate()
        return sofaInternals;
    };

    sofaInternals.design.fixtures = function (fixturesArray) {

        internals.designFixtures = fixturesArray;

        return sofaInternals;
    };

    sofaInternals.design.load = function (done) {

        // clone internal variables avoiding async conflict issues.

        var designName = Hoek.clone(internals.designName);
        var fixtures = Hoek.clone(internals.designFixtures);
        var designDocument = Hoek.clone(internals.designDocumentToLoad);

        Async.waterfall([function (next) {

            // load design document
            // insertDesign():
            //  - if document exists updates design document do insert new doc.
            //  - if not exists creates new design document.
            //  * below insertDesign addresses this logic.

            // @todo debug
            // this is async and waterfall does not waite for next()
            // before movign on. for this code it d/n cause error but
            // this needs to be cleaned up.
            internals.context.insertDesign(
                designDocument,
                '_design/' + designName,
                function (err, result) {

                    console.log('created design/document: ' + JSON.stringify(result));
                    return next();
                });

        }, function (next) {

            if (sofaInternals.live === true) {

                // live state do not load fixtures.

                return next();
            }

            if (designName === 'user') {

                // hash user passwords.

                for (var i = 0; i < fixtures.length; ++i) {

                    // hash the pw

                    var salt = Bcrypt.genSaltSync(SALT_WORK_FACTOR);
                    var hash = Bcrypt.hashSync(fixtures[i].pw, salt);
                    // console.log('hashed value: ' + hash);
                    fixtures[i].pw = hash;
                }
            }

            // insert fixtures

            sofaInternals.db.bulk({ docs: fixtures }, function (err, body, headers) {

                if (err) {

                    console.log('bulkinsert err: ' + err);
                }

                // fixtures inserted

                console.log(designName + ' fixtures generated: ' + body);

                return next();
            });

        }], function (err) {

            // test if design/document was created

            sofaInternals.foundation.core.findById('_design/' + designName, function (err, result) {

                // design loaded

                console.log(result._id + ' created');
                // watch  done();
            });
        });
    };

    this.loadDesigns = function (callback) {

        if (sofaInternals.manifest.designs.length === 0) {

            return callback(null, 'no designs to load.');
        }

        var designs = [];

        for (var i = 0; i < sofaInternals.manifest.designs.length; ++i) {

            var designToLoad = sofaInternals.composeOptions.relativeTo + '/' + Object.keys(sofaInternals.manifest.designs[i])[0];

            var designGroup = require(designToLoad);

            designs.push(designGroup);
        };

        Async.each(designs, function (design, callback) {

            // load the design,
            // callback executed at completion of loading.

            design.call(sofaInternals, sofaInternals, callback);

        }, function (err) {

            if (err)
            {
                console.log('Error when loading designs: \n' + err);
            }

            console.log('---------------------');
            console.log('sofajs designs loaded ');
        });

        // return callback(null, 'success: designs loaded');
        // return internals.context;
    };

    return this;
};
