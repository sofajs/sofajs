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
                docsPort: Joi.number().required()
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

            //console.log('compose executed');
            //console.log(JSON.stringify(manifest));
            //console.log(JSON.stringify(composeOptions));

            console.log('validations passed ' + result);
            console.log('sofaInternals ' + JSON.stringify(sofaInternals));

            return internals.loadPromises(manifest, composeOptions, sofaInternals);
        });

        return this;
    };

    return this;
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

        console.log('tool: ' + Object.keys(manifest.tools[i])[0]);

        var toolToLoad = composeOptions.relativeTo + '/' + Object.keys(manifest.tools[i])[0];

        var toolGroup = require(toolToLoad);

        // mixin the tool group

        toolGroup.call(sofaInternals, sofaInternals);
    }

    return internals.loadDesigns(manifest, composeOptions);
};

internals.loadDesigns = function (manifest, composeOptions) {

    for (var i = 0; i < manifest.designs.length; ++i) {

        var designToLoad = composeOptions.relativeTo + '/' + Object.keys(manifest.designs[i])[0];

        var designGroup = require(designToLoad);

        // mixin the tool group

        designGroup.call(sofaInternals, sofaInternals);
        //  console.log('designs: ' + Object.keys(manifest.designs[i])[0]);
    };
};
