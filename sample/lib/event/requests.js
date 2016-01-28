// event/requests.js

var internals = {};
var sofaInternals = {};

exports = module.exports = internals.Event = function (sofaInternalsParam) {

    internals.context = this;
    sofaInternals = sofaInternalsParam;

    internals.requestGroupName = 'event';

    sofaInternals.request.register(internals.requestGroupName)
        .requests([

            // test

            {
                name: 'test',
                group: internals.requestGroupName,
                comment: 'test value',
                handler: function (callback) {

                    // console.log('db' + JSON.stringify(sofaInternals.db));
                    return callback(null, 'requests.event.test() executed');
                }
            }
        ]);
};
