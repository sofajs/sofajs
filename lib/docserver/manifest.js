
var composer = module.exports = {};

composer.manifest = {
    connections: [
        {
            host: 'localhost',
            port: 8000,
            labels: ['web']
        }],
    plugins: {
        './lib/docs': [{
            'select': ['web']
        }],
        'vision': {},
        'inert': {}
    }
};

composer.composeOptions = {
    relativeTo: __dirname
};

