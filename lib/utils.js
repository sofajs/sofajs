// lib/utils.js
// sofajs internal utilities
// utils do not enforce a dbconnection previous to function execution.
// loads plugins located in ./lib/internals/utils/


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

exports = module.exports =  internals.Utils = function (sofaInternalsParam) {

    sofaInternals = sofaInternalsParam;
    internals.context = this;

    sofaInternals.utils = {};

    if (sofaInternals.docs === undefined) {
        sofaInternals.docs = {};
        sofaInternals.docs.utils = {};
    } else {
        sofaInternals.docs.utils = {};
    }


    sofaInternals.utils.register = function (utilityGroupName) {

        // registers utilityGroup
        // loads existing utilities from the internal manifest.

        // console.log('generating internal: ' + utilityGroupName);
        Hoek.assert(typeof utilityGroupName ===  'string' ,
                'utility name ' + utilityGroupName + ' must be a string.');

        sofaInternals.utils[utilityGroupName] = { name: utilityGroupName };

        return sofaInternals;
    };

    sofaInternals.utils.functions = function (utilities) {

        Hoek.assert(sofaInternals.isArray(utilities) === true, 'the submitted utility array is not a valid Array.');

        for (var i = 0; i < utilities.length; ++i) {

            internals.loadUtility(utilities[i]);
        }

        return sofaInternals;
    };
};

internals.loadUtility = function (utility) {

    var F = function () {};

    F.prototype.request = function () {

        var params = arguments;

        var paramCount = internals.countParams(utility.handler);

        if (paramCount === 0) {
            return  utility.handler.call(internals.context);
        } else if (paramCount === 3) {
            // return designObject.handler.call(internals.context, params[0]);
            return utility.handler.call(sofaInternals, params[0], params[1], params[2]);
        } else if (paramCount === 2) {
            return utility.handler.call(sofaInternals, params[0],  params[1]);
        } else if (paramCount === 1) {
            return utility.handler.call(sofaInternals, params[0]);
        }

    };

    // construct the new request

    var newRequest = new F().request;

    // load request into sofajs.utils.utilGroup object

    sofaInternals.utils[utility.group][utility.name] = {};
    sofaInternals.utils[utility.group][utility.name] = newRequest;

    // build docs

    if (sofaInternals.docs.utils[utility.group] === undefined) {
        // docs tool group does not exist make it
        sofaInternals.docs.utils[utility.group] = {};
        sofaInternals.docs.utils[utility.group].methods = {};
    }

    sofaInternals.docs.utils[utility.group].methods[utility.name] = {};

    // get function signature for docs

    var functionString = utility.handler.toString();
    var signatureBegin = functionString.search(/\({1}/);
    var signatureEnd = functionString.search(/\){1}/);
    var signature = functionString.slice(signatureBegin, signatureEnd + 1);

    // load signature into docs
    // comments have markup processed

    sofaInternals.docs.utils[utility.group].methods[utility.name].signature = signature;
    sofaInternals.docs.utils[utility.group].methods[utility.name].comment = Marked(utility.comment);

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
