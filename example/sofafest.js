var composer = module.exports = {};


composer.manifest = {
    connections: [
        {
            db: 'sofajs',
            host: 'http://localhost',
            port: 5984,
            user: 'hapiadmin',
            pw: 'N3wUPwGo',
            sessionLife: 600000, // this must match session length configured in ./etc/couchdb/local.ini.
                                 // example in milliseconds, default 10 mins 600000
            docsPort: 6000
        }
    ],
    interfaces: [{
        './interfaces/user': [{
            'name': 'user'
        }]
    }],
    designs: [{
        './designs/user': [{
            'name': 'user'
        }]
    }],
    tools: [{
        './tools/core': [{
            'name': 'core'
        }]
    }],
    promises: [{
        './promises/connectPromises': [{
            'name': 'connection'  // put these promises into utils
        }]
    },
    {
        './promises/requestPromises': [{
            'name': 'requests'
        }]
    }]
};


composer.composeOptions = {
    relativeTo: __dirname
};
