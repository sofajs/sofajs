var composer = module.exports = {};

composer.manifest = {
    utils: [
        { './core': [
            {
                'name': 'core'
            }]
        }
    ]
};

composer.composeOptions = {
    relativeTo: __dirname
};
