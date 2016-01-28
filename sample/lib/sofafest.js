var composer = module.exports = {};

composer.manifest = {
    name: 'sofajs-sample',
    connections: [
        {
            db: 'sofajs-sample',
            host: 'http://localhost',
            port: 5984,
            user: 'hapiadmin',
            pw: 'N3wUPwGo',
            sessionLife: 600000,  // this must match session length configured in ./etc/couchdb/local.ini.
                                  // example in milliseconds, default is 10 mins 600000

            live: false     // live: true
                            //  * d/n load fixtures
                            //  * update designs rather than load new ones.
        }
    ],
    docs: {
        port: 9000       // port docs display on.
    },
    requests: [
        {
            './user/requests': [{
                'name': 'user'
            }]
        },
        {
            './event/requests': [{
                'name': 'event' // requests.event()
            }]
        }
    ],
    designs: [
        {
            './user/design': [{
                'name': 'user'
            }]
        }
    ],
    tools: [
        {
            './user/tools': [{
                'name': 'user'
            }]
        }
    ],
    promises: []
};


composer.composeOptions = {
    relativeTo: __dirname
};
