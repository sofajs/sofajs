var Hoek = require('hoek');

var internals = {};
var sofaInternals = {};

exports = module.exports = internals.Tools = function (sofaInternalsParam) {

    internals.context = this;
    sofaInternals = sofaInternalsParam;
    sofaInternals.tool = {};
    sofaInternals.tools = {};

    if (sofaInternals.docs === undefined) {
        sofaInternals.docs = {};
        sofaInternals.docs.tools = {};
    }

    this.toolidentity = 'promise identity';

    sofaInternals.tool.register = function (toolName) {

        // registers new group of tools
        // loads existing tool data at manifest.

        Hoek.assert(typeof toolName ===  'string' , 'tool name ' + toolName + ' must be a string.');
        Hoek.assert(sofaInternals.tools[toolName] === undefined , 'Tool group ' + toolName + ' already exists.');

        internals.toolName = toolName;
        sofaInternals.tools[toolName] = { name: toolName };

        return sofaInternals;
    };

    sofaInternals.tooldocs = function (toolGroupName, toolDocsDescription) {

        if (sofaInternals.docs.tools[toolGroupName] === undefined) {
            // docs tool group does not exist make it
            sofaInternals.docs.tools[toolGroupName] = {};
        }

        sofaInternals.docs.tools[toolGroupName].description = toolDocsDescription;
        sofaInternals.docs.tools[toolGroupName].methods = {};

        return sofaInternals;
    };

    sofaInternals.tools = function (tools) {

        // internals.context = this;

        Hoek.assert(internals.isArray(tools) === true, 'the submitted tools array is not valid Array.');

        for (var i = 0; i < tools.length; ++i) {

            internals.loadTool(tools[i]);
        }

        return sofaInternals;
    };

    return this;
};

internals.loadTool = function (toolObject) {

    var F = function () {};

    // compose Promise

    F.prototype.tool = function () {

        var fire;

        // handle arguments here

        if (arguments.length === 0) {
            fire = toolObject.handler.call(sofaInternals);
        } else if (arguments.length === 1) {
            fire = toolObject.handler.call(sofaInternals, arguments[0]);
        } else if (arguments.length === 2) {
            fire = toolObject.handler.call(sofaInternals, arguments[0],  arguments[1]);
        } else if (arguments.length === 3) {
            fire = toolObject.handler.call(sofaInternals, arguments[0], arguments[1], arguments[2]);
        }

        return  fire;
    };

    var newTool = new F().tool;

    // ensure no duplicate method names

    Hoek.assert(sofaInternals.tools[toolObject.group][toolObject.name] === undefined ,
            'Error: ' + toolObject.group + '.' + toolObject.name + ' already exists.');

    sofaInternals.tools[toolObject.group][toolObject.name] = {};
    sofaInternals.tools[toolObject.group][toolObject.name] = newTool;

    // build docs

    if (sofaInternals.docs.tools[toolObject.group] === undefined) {
        // docs tool group does not exist make it
        sofaInternals.docs.tools[toolObject.group] = {};
        sofaInternals.docs.tools[toolObject.group].methods = {};
    }

    sofaInternals.docs.tools[toolObject.group].methods[toolObject.name] = {};

    // load function signature into docs

    var functionString = toolObject.handler.toString();
    var signatureEnd = functionString.search(/\){1}/);
    var signature = functionString.slice(0, signatureEnd + 1);

    sofaInternals.docs.tools[toolObject.group].methods[toolObject.name].signature = signature;
    sofaInternals.docs.tools[toolObject.group].methods[toolObject.name].comment = toolObject.comment;

    return sofaInternals;
};

internals.isArray = function (value) {

    return value && typeof value === 'object' && value.constructor === Array;
};
