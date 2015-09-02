var Hoek = require('hoek');

var internals = {};
var sofaInternals = {};

exports = module.exports =  internals.Requests = function (sofaInternalsParam) {

    sofaInternals = sofaInternalsParam;

    internals.context = this;
    internals.context.requests = {};

    sofaInternals.request = {};
    sofaInternals.requests = {};


    sofaInternals.request.register = function (requestGroupName) {

        // registers new group of promises
        // loads existing promise data at manifest.

        Hoek.assert(typeof requestGroupName ===  'string' ,
                'design name ' + requestGroupName + ' must be a string.');
        Hoek.assert(internals.context.requests[requestGroupName] === undefined ,
                'Promise ' + requestGroupName + ' already exists.');

        // internals.context.requests[requestGroupName] = { name: requestGroupName };
        sofaInternals.requests[requestGroupName] = { name: requestGroupName };

        return sofaInternals;
    };

    sofaInternals.requests = function (requests) {

        internals.context = this;

        Hoek.assert(sofaInternals.isArray(requests) === true, 'the submitted designs array is not a valid Array.');

        for (var i = 0; i < requests.length; ++i) {

            internals.loadRequest(requests[i]);
        }

        return sofaInternals;
    };
};

internals.loadRequest = function (request) {

    // request process
    // * connect
    // * execute request

    var F = function () {};

    F.prototype.request = function () {

            var params = arguments;

            // introspection, count number of arguments in function to be built.

            var paramCount = internals.countParams(request.handler);

            // load function with context and appropriate params set.
            // three max params allowed to be sent.
            // loads with sofaInternals as object context so all internals
            // functions are available for use inside request functions.

            if (paramCount === 0) {
                return  request.handler.call(internals.context);
            } else if (paramCount === 3) {
                // return designObject.handler.call(internals.context, params[0]);
                return request.handler.call(internals.context, params[0], params[1], params[2]);
            } else if (paramCount === 2) {
                return request.handler.call(internals.context, params[0],  params[1]);
            } else if (paramCount === 1) {
                return request.handler.call(internals.context, params[0]);
            }
        };

    // construct the new request

    var newRequest = new F().request;

    // load request into sofajs requests object.
    // this allows requests to be called later.

    sofaInternals.requests[request.group][request.name] = {};
    sofaInternals.requests[request.group][request.name] = newRequest;

    return sofaInternals;
};

internals.countParams = function (requestFunction) {

    // introspection, count number of argments in function to build.
    // count number of commas between (), then add 1.

    // get signature from function

    var functionString = requestFunction.toString();
    var signatureBegin = functionString.search(/\({1}/) - 1;
    var signatureEnd = functionString.search(/\){1}/) + 1;
    var signature = functionString.slice(signatureBegin, signatureEnd);

    var count = 0;

    for (var i = 0; i < signature.length; ++i) {

        if (signature[i] === ',') {
            ++count;
        }
    };

    // add 1 to final count of parameters.

    ++count;

    // if one param, test if it is empty string

    if (count === 1) {

        var regex = /\(\s*\)/;

        if (signature.match(regex)) {

            // decrease params count to 0;
            --count;
        }
    }
    return count;
};
