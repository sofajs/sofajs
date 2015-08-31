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

    sofaInternals.design.views = function (designViewsArray) {

        console.log('views ' + designViewsArray);
        return sofaInternals;
    };

    sofaInternals.design.updates = function (designUpdatesArray) {

        console.log('updates ' + designUpdatesArray);

        return sofaInternals;
    };

    sofaInternals.design.fixtures = function (fixturesArray) {

        console.log('fixturesArray ' + fixturesArray);

        return sofaInternals;
    };

    return this;
};
