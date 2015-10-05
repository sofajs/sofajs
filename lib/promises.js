var Hoek = require('hoek');

var internals = {};
var sofaInternals = {};

exports = module.exports = internals.Promises = function (sofaInternalsParam) {

    sofaInternals = sofaInternalsParam;
    sofaInternals.promise = {};
    sofaInternals.promises = {};

    if (sofaInternals.docs === undefined) {
        sofaInternals.docs = {};
        sofaInternals.docs.promises = {};
    } else {
        sofaInternals.docs.promises = {};
    }

    sofaInternals.promise.identity = 'promise identity';

    sofaInternals.promise.register = function (promiseName) {

        // registers new group of promises
        // loads existing promise data at manifest.

        Hoek.assert(typeof promiseName ===  'string' , 'promise name ' + promiseName + ' must be a string.');
        // Hoek.assert(internals.context.promises[promiseName] === undefined , 'Promise ' + promiseName + ' already exists.');

        if (sofaInternals.promises[promiseName] === undefined) {
            sofaInternals.promises[promiseName] = { name: promiseName };
        }

        sofaInternals.promises[promiseName] = { name: promiseName };

        return sofaInternals;
    };

    sofaInternals.promises = function (promises) {

        // load array of promises

        Hoek.assert(internals.isArray(promises) === true, 'the submitted promises array is not a valid Array.');

        for (var i = 0; i < promises.length; ++i) {

            // console.log('loading promise ' + JSON.stringify(promises[i]));
            internals.loadpromise(promises[i]);
        }

        return sofaInternals;
    };
};

internals.loadpromise = function (promiseObject) {

    var F = function () {};

    // compose Promise

    var fire;

    F.prototype.promise = function () {

        // handle arguments here

        if (arguments.length === 0) {
            fire = promiseObject.handler.call(sofaInternals);
        } else if (arguments.length === 1) {
            fire = promiseObject.handler.call(sofaInternals, arguments[0]);
        } else if (arguments.length === 2) {
            fire = promiseObject.handler.call(sofaInternals, arguments[0],  arguments[1]);
        } else if (arguments.length === 3) {
            fire = promiseObject.handler.call(sofaInternals, arguments[0], arguments[1], arguments[2]);
        } else {
            Hoek.assert(false === true, 'incorrect amount of arguments sent to promise');
        }

        // return the promise

        return  fire;
    };

    var newRequest = new F().promise;

    sofaInternals.promises[promiseObject.group][promiseObject.name] = {};
    sofaInternals.promises[promiseObject.group][promiseObject.name] = newRequest;

    if (sofaInternals.docs.promises[promiseObject.group] === undefined) {

        // docs promise group does not exist make it

        sofaInternals.docs.promises[promiseObject.group] = {};
        sofaInternals.docs.promises[promiseObject.group].methods = {};
    }

    sofaInternals.docs.promises[promiseObject.group].methods[promiseObject.name] = {};

    // load function signature into docs

    var functionString = promiseObject.handler.toString();
    var signatureBegin= functionString.search(/\({1}/);
    var signatureEnd = functionString.search(/\){1}/);
    var signature = functionString.slice(signatureBegin, signatureEnd + 1);

    sofaInternals.docs.promises[promiseObject.group].methods[promiseObject.name].signature = signature;
    sofaInternals.docs.promises[promiseObject.group].methods[promiseObject.name].comment = promiseObject.comment;


    return sofaInternals;
};

internals.isArray = function (value) {

    return value && typeof value === 'object' && value.constructor === Array;
};
