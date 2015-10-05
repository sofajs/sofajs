
var Path = require('path');

var internals = {};


exports.register = function (server, options, next) {

    // Registration logic in internals.after will execute on
    // server start only after dependencies are fully registered.
    server.dependency(['vision', 'inert'], internals.after);

    next();
};

internals.after= function (server, next) {

    server.views({
        engines: {
            jade: require('jade')
        },
        path: '../views',
        partialsPath: '../views/partials',
        relativeTo: __dirname
    });

    server.route({
        method: 'GET',
        path: '/public/{path*}',
        config: {
            handler: {
                directory: {
                    path: Path.join(__dirname, '..', 'public'),
        index: false,
        redirectToSlash: false
                }
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/',
        config: {
            description: 'sofajs docserver homepage'
        },
        handler: function (request, reply) {

            return reply.view('home', { docs: server.app.sofaDocs} );
        }
    });

    next();
};

exports.register.attributes = {
        name: 'Home'
};

