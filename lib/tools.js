var Hoek = require('hoek');

var internals = {};
var sofaInternals = {};

exports = module.exports = internals.Tools = function (sofaInternalsParam) {

    internals.context = this;
    sofaInternals = sofaInternalsParam;
    sofaInternals.tool = {};
    sofaInternals.tools = {};
    sofaInternals.docs = {};
    if (sofaInternals.docs === undefined) {
        sofaInternals.docs.tools = {};
    }

    sofaInternals.docs = {};
    sofaInternals.docs.tools = {};

    this.toolidentity = 'promise identity';

    sofaInternals.tool.register = function (toolName) {

        // registers new group of tools
        // loads existing tool data at manifest.

        Hoek.assert(typeof toolName ===  'string' , 'tool name ' + toolName + ' must be a string.');
        Hoek.assert(sofaInternals.tools[toolName] === undefined , 'Tool group ' + toolName + ' already exists.');

        sofaInternals.tools[toolName] = { name: toolName };

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

    // @todo think through where to put tools in sofa object
    // if at first level, chaining would be more elegant

    sofaInternals.tools[toolObject.group][toolObject.name] = {};
    sofaInternals.tools[toolObject.group][toolObject.name] = newTool;

    // build docs
    if (sofaInternals.docs.tools[toolObject.group] === undefined) {
        // if docs tool group does exist make it
        sofaInternals.docs.tools[toolObject.group] = {};
    }

    sofaInternals.docs.tools[toolObject.group][toolObject.name] = {};

    // get function signature
    var functionString = toolObject.handler.toString();
    var signatureEnd = functionString.search(/\){1}/);
    var signature = functionString.slice(0, signatureEnd + 1);

    sofaInternals.docs.tools[toolObject.group][toolObject.name].signature = signature;
    sofaInternals.docs.tools[toolObject.group][toolObject.name].comment = toolObject.comment;

    // console.log('docs name: ' + toolObject.name);
    // console.log('signature: ' + sofaInternals.docs.tools[toolObject.group][toolObject.name].signature);

    return sofaInternals;
};

internals.isArray = function (value) {

    return value && typeof value === 'object' && value.constructor === Array;
};
