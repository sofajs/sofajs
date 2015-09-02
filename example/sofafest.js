var composer = module.exports = {};


composer.manifest = {
    connections: [
        {
            db: 'sofajs',
            host: 'http://localhost',
            port: 5984,
            user: 'hapiadmin',
            pw: 'N3wUPwGo',
            sessionLife: 600000,  // this must match session length configured in ./etc/couchdb/local.ini.
                                 // example in milliseconds, default 10 mins 600000
            live: false
        }
    ],
    docs: {
        localServer: true,   // true starts docs server
        docsPort: 6000       // port hapi will display docs on.
    },
    requests: [{
        './requests/user': [{
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
        './promises/general': [{
            'name': 'general'
        }]
    }]
};


composer.composeOptions = {
    relativeTo: __dirname
};
