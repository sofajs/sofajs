var Promise = require('bluebird');
var Hoek = require('hoek');

var internals = {};
var sofaInternals = {};


exports = module.exports = internals.User = function (sofaInternalsParam) {

    internals.context = this;
    sofaInternals = sofaInternalsParam;

    internals.requestGroupName = 'user';

    sofaInternals.request.register(internals.requestGroupName)
        .requests([

            // getuser

            {
                name: 'getuser',
                group: internals.requestGroupName,
                comment: 'get user function',
                handler: function (params, callback) {

                    console.log('execute requests function getuser()');

                    // check for connection errors
                    // all design functions create a db connection before executing the function.
                    // If connection has an error, err object will be in first parameter.

                    if (arguments[0] && arguments[0].name === 'Error'){

                        callback(arguments[0]);
                        return this;
                    }

                    callback(null, 'requests getuser() succeeded');
                    return internals.context;
                }
            },
            {
                name: 'test',
                group: internals.requestGroupName,
                comment: 'user requests test function',
                handler: function (params, callback) {

                    console.log('execute requests function test() ' + params);

                    // check for connection errors
                    // all design functions create a db connection before executing the function.
                    // If connection has an error, err object will be in first parameter.

                    if (arguments[0] && arguments[0].name === 'Error'){

                        callback(arguments[0]);
                        return this;
                    }

                    callback(null, 'test request executed');
                    return internals.context;
                }
            },
            {
                name: 'test2',
                group: internals.requestGroupName,
                comment: 'user requests test function',
                handler: function (params, options, callback) {

                    console.log('execute test2() params ' + params);
                    console.log('execute test2() options ' + options);

                    // check for connection errors
                    // all design functions create a db connection before executing the function.
                    // If connection has an error, err object will be in first parameter.

                    if (arguments[0] && arguments[0].name === 'Error'){

                        callback(arguments[0]);
                        return this;
                    }

                    callback(null, 'test2 request return from callback');
                    return internals.context;
                }
            },
            {
                name: 'test3',
                group: internals.requestGroupName,
                comment: 'user requests test function',
                handler: function (callback) {

                    console.log('execute test3() one callback param');

                    // check for connection errors
                    // all design functions create a db connection before executing the function.
                    // If connection has an error, err object will be in first parameter.

                    if (arguments[0] && arguments[0].name === 'Error'){

                        callback(arguments[0]);
                        return this;
                    }

                    callback(null, 'test3 sending callback received one param');
                    return internals.context;
                }
            },
            {
                name: 'test4',
                group: internals.requestGroupName,
                comment: 'user requests test function',
                handler: function () {

                    console.log('execute test4() no params sent');

                    // check for connection errors
                    // all design functions create a db connection before executing the function.
                    // If connection has an error, err object will be in first parameter.

                    if (arguments[0] && arguments[0].name === 'Error'){

                        // callback(arguments[0]);
                        return this;
                    }

                    return internals.context;
                }
            }
        ]);
};
