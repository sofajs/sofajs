var Hoek = require('hoek');

var internals = {};
var sofaInternals = {};

exports = module.exports = internals.Tools = function (sofaInternalsParam) {

    internals.context = this;
    sofaInternals = sofaInternalsParam;
    sofaInternals.design = {};
    sofaInternals.designs = {};

    sofaInternals.design.register = function (designName) {

        Hoek.assert(typeof designName ===  'string' , 'design name ' + designName + ' must be a string.');
        Hoek.assert(sofaInternals.designs[designName] === undefined , 'Design group ' + designName + ' already exists.');
        console.log('register design: ' + designName);

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

        internals.designFunctionsToLoad = {
                language: 'javascript',
                views: designViewsObject
            };

        console.log('views ' + Hoek.stringify(internals.designFunctionsToLoad));
        return sofaInternals;
    };

    sofaInternals.design.updates = function (designUpdatesObject) {

        internals.designFunctionsToLoad.updates = designUpdatesObject;
        console.log('updates ' + Hoek.stringify(designUpdatesObject));
        // console.log('designFunctions ' + JSON.stringify(internals.designFunctionsToLoad.updates.testUpdate()));
        // internals.designFunctionsToLoad.updates.testUpdate()
        return sofaInternals;
    };

    sofaInternals.design.fixtures = function (fixturesArray) {

        internals.designFixtures = fixturesArray;
        console.log('fixturesArray ' + internals.designFixtures);
        return sofaInternals;
    };

    sofaInternals.design.load = function () {

        // make queries to insert design
        console.log('load the design');
    };

    return this;
};
