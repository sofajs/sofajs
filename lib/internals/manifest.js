var composer = module.exports = {};

composer.manifest = {
    utils: [
        { './utils/core': [
            {
                'name': 'core'
            }]
        }
    ],
    foundation: [
        { './foundation/core': [
            {
                'name': 'core'
            }]
        }
    ]
};

composer.composeOptions = {
    relativeTo: __dirname
};
