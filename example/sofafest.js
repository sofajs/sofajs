var composer = module.exports = {};

composer.manifest = {
    name: 'example',
    connections: [
        {
            db: 'sofajs',
            host: 'http://localhost',
            port: 5984,
            user: 'hapiadmin',
            pw: 'N3wUPwGo',
            sessionLife: 600000,  // this must match session length configured in ./etc/couchdb/local.ini.
                                  // example in milliseconds, default is 10 mins 600000

            live: false              // live: true
                                    //  * d/n load fixtures
                                    //  * update designs rather than load new ones.
        }
    ],
    docs: {
        port: 9000       // port docs display on.
    },
    requests: [
        {
            './user/requestsUser': [{
                'name': 'user'
            }]
        },
        { './tools/requestsCore': [
            {
                'name': 'core' // requests.core()
            }]
        }
    ],
    designs: [{
        './user/designUser': [{
            'name': 'user'
        }]
    }],
    tools: [
        {
            './tools/core': [{
                'name': 'core'
            }]
        },
        {
            './user/tools': [{
                'name': 'user'
            }]
        }
    ],
    promises: [{
        './promises/general': [{
            'name': 'general'
        }]
    }]
};


composer.composeOptions = {
    relativeTo: __dirname
};
