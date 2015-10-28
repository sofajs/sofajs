// lib/foundation.js
// The foundation object contains request functions
// which create a database connection before being executed.
// This allows foundation functions to be executed independently of a
// sofajs.request object. Plus, these functions will be exposed
// in the external sofajs object for other programs to execute.

var Hoek = require('hoek');
var Marked = require('marked');

var internals = {};
var sofaInternals = {};

Marked.setOptions({
    renderer: new Marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: true,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false,
    highlight: function (code, lang) {

        return require('highlight.js').highlightAuto(code).value;
    }
});

exports = module.exports =  internals.Foundation = function (sofaInternalsParam) {

    sofaInternals = sofaInternalsParam;
    internals.context = this;

    if (sofaInternals.docs === undefined) {
        sofaInternals.docs = {};
    }

    if (sofaInternals.foundation === undefined) {
        sofaInternals.foundation = {};
        sofaInternals.docs.foundation = {};
    }

    sofaInternals.foundation.register = function (requestGroupName) {

        // registers new group of requests
        // loads existing requests  manifest.

        Hoek.assert(typeof requestGroupName ===  'string' ,
                'design name ' + requestGroupName + ' must be a string.');


        sofaInternals.foundation[requestGroupName] = { name: requestGroupName };

        return sofaInternals;
    };

    sofaInternals.foundation.requests = function (requests) {

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

        // introspection, count number of arguments in handler function to be built.
        // if needed, evaluate params, for example, next() set or not.

        var paramCount = internals.countParams(request.handler);

        // load function with context and appropriate params set.
        // three max params allowed to be sent.

        return sofaInternals.connect(function (err) {

            // logError
            // @todo plan out error logging logError
            // if (err) {
            //     // return  request.handler.call(internals.context, err);
            //     params[0] = err;
            // }

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
        });
    };

    // construct the new request

    var newRequest = new F().request;

    // load request into sofajs requests object
    // this allows requests to be called later

    // console.log('data: ' + request.group + ' method: ' + request.name);
    // console.log('request: ' + newRequest);
    sofaInternals.foundation[request.group][request.name] = {};
    sofaInternals.foundation[request.group][request.name] = newRequest;

    // build docs

    if (sofaInternals.docs.foundation[request.group] === undefined) {
        // docs tool group does not exist make it
        sofaInternals.docs.foundation[request.group] = {};
        sofaInternals.docs.foundation[request.group].methods = {};
    }

    sofaInternals.docs.foundation[request.group].methods[request.name] = {};

    // load function signature into docs

    var functionString = request.handler.toString();
    var signatureBegin = functionString.search(/\({1}/);
    var signatureEnd = functionString.search(/\){1}/);
    var signature = functionString.slice(signatureBegin, signatureEnd + 1);

    sofaInternals.docs.foundation[request.group].methods[request.name].name = request.name;
    sofaInternals.docs.foundation[request.group].methods[request.name].signature = signature;
    sofaInternals.docs.foundation[request.group].methods[request.name].comment = Marked(request.comment);

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
