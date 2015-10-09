var Hoek = require('hoek');
var Async = require('async');

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

        Hoek.assert(typeof designName ===  'string' , 'design name ' + designName + ' must be a string.');
        Hoek.assert(sofaInternals.designs[designName] === undefined , 'Design group ' + designName + ' already exists.');
        console.log('register design: ' + designName);
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

        console.log('views designViewsObject: ' + Hoek.stringify(designViewsObject));

        // var string = internals.designDocumentToLoad.views.test({username: 'go', first: 'jon', last: 'swenson', email: 'js' });

        // console.log('views '+ length);

        var views = designViewsObject;

        // loop through each design document object.

        var keys = Object.keys(views);

        for (var i = 0; i < keys.length; ++i) {

            // get name of the view function

            // simple validation add more later if desired 

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
        console.log('updates ' + Hoek.stringify(designUpdatesObject));
        // console.log('designFunctions ' + JSON.stringify(internals.designDocumentToLoad.updates.testUpdate()));
        // internals.designDocumentToLoad.updates.testUpdate()
        return sofaInternals;
    };

    sofaInternals.design.fixtures = function (fixturesArray) {

        internals.designFixtures = fixturesArray;

        return sofaInternals;
    };

    sofaInternals.design.load = function () {

        // make queries to insert design
        console.log('loading the design');
        // callback(null, 'boom loadeded');

        Async.waterfall([
                function (next) {

                    // load fixuture data.

                    sofaInternals.db.bulk({ docs: internals.designFixtures }, function (err, body, headers) {

                        if (err) {

                            console.log('bulkinsert err: '+ err);
                        }

                        // promise resolved
                        console.log('added fixuters'+ body);
                        next();
                    });
                },
                function (next) {

                    // load design document

                    sofaInternals.tools.core.insertid(
                        internals.designDocumentToLoad, 
                        '_design/'+ internals.designName, 
                        function (err, result) {

                            console.log('created design/document: '+ JSON.stringify(result));
                            next();
                        });
                }], function (err) {

                    console.log('async is finished');
                });


        console.log('Design name: '+ internals.designName + ' _designs & fixtures loaded');
    };

    return this;
};
