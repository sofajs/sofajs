var Joi = require('joi');
var Hoek = require('hoek');

var internals = {};
var sofaInternals = {};

exports = module.exports = internals.Composer = function (sofaInternalsParam) {

    internals.context = this;
    sofaInternals = sofaInternalsParam;

    this.identity = 'composer';

    this.compose = function (manifest, composeOptions) {

        internals.context = this;
        sofaInternals.credentials = {};
        sofaInternals.session = {};

        // only called at startup

        var credentials = {
            schema: Joi.object({
                db: Joi.string().required(),
                host: Joi.string().required(),
                user: Joi.string().required(),
                pw: Joi.string().required(),
                port: Joi.number().required(),
                sessionLife: Joi.number().required(),
                live: Joi.boolean().required()
            })
        };

        Joi.validate(manifest.connections[0], credentials.schema, function (err, result) {

            Hoek.assert(!err, '\nmanifest connection credentials failed validation \n' + err + '\n');

            sofaInternals.credentials.db = result.db;
            sofaInternals.credentials.host = result.host;
            sofaInternals.credentials.user = result.user;
            sofaInternals.credentials.pw = result.pw;
            sofaInternals.credentials.port = result.port;
            sofaInternals.session.life = result.sessionLife;
            sofaInternals.live = result.live;

            //console.log(JSON.stringify(manifest));
            //console.log(JSON.stringify(composeOptions));

            // ** load internal utilities first

            return internals.loadUtils(manifest, composeOptions);
            // return internals.loadPromises(manifest, composeOptions, sofaInternals);
        });

        return this;
    };

    return this;
};

internals.loadUtils = function (manifest, composeOptions) {

    // load internalManifest

    var internalManifest = require('../lib/internals/manifest');

    for (var i = 0; i < internalManifest.manifest.utils.length; ++i) {

        var utilsToLoad = internalManifest.composeOptions.relativeTo + '/' + Object.keys(internalManifest.manifest.utils[i])[0];

        var utilityGroup = require(utilsToLoad);

        // mixin the utility group

        utilityGroup(sofaInternals, sofaInternals);
    }

    // load sofajs internal foundation requests

    for (i = 0; i < internalManifest.manifest.foundation.length; ++i) {

        var foundationToLoad = internalManifest.composeOptions.relativeTo + '/' + Object.keys(internalManifest.manifest.foundation[i])[0];

        var foundationRequestGroup = require(foundationToLoad);

        // mixin the foundation group

        foundationRequestGroup(sofaInternals, sofaInternals);
    }

    return internals.loadPromises(manifest, composeOptions);
};

internals.loadPromises = function (manifest, composeOptions) {

    // console.log('loadPromises of Internals ' + JSON.stringify(sofaInternals));

    // load promise groups

    for (var i = 0; i < manifest.promises.length; ++i) {

        var promiseToLoad = composeOptions.relativeTo + '/' + Object.keys(manifest.promises[i])[0];

        var promiseGroup = require(promiseToLoad);

        // mixin the promise group

        // promiseGroup(sofaInternals);
        // promiseGroup(sofaInternals, null);
        promiseGroup(sofaInternals, sofaInternals);
    }

    return internals.loadTools(manifest, composeOptions);
};

internals.loadTools = function (manifest, composeOptions) {

    for (var i = 0; i < manifest.tools.length; ++i) {

        var toolToLoad = composeOptions.relativeTo + '/' + Object.keys(manifest.tools[i])[0];

        var toolGroup = require(toolToLoad);

        // mixin the tool group

        toolGroup.call(sofaInternals, sofaInternals);
    }

    // designs and fixtures should only be loaded in dev state
    // and not be composed with live interface.
    if (sofaInternals.live === true) {

        return internals.loadRequests(manifest, composeOptions);
    }

    return internals.loadRequests(manifest, composeOptions);
};

internals.loadRequests = function (manifest, composeOptions) {

    // console.log('manifest ' + JSON.stringify(manifest));
    // console.log('composeOptions ' + composeOptions);
    // console.log('manifest.requests.length ' + manifest.requests.length);

    for (var i = 0; i < manifest.requests.length; ++i) {

        var requestsToLoad = composeOptions.relativeTo + '/' + Object.keys(manifest.requests[i])[0];
        console.log('load loop: ' + requestsToLoad);
        var requestGroup = require(requestsToLoad);

        // mixin the requestGroup

        requestGroup.call(internals.context, sofaInternals);
    };

    return internals.context;
};


