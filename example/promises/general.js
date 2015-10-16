var Promise = require('bluebird');
var Hoek = require('hoek');

var internals = {};
var sofaInternals = {};

exports = module.exports = internals.generalPromises = function (sofaInternalsParam) {

    sofaInternals = sofaInternalsParam;
    // Hoek.assert(this.identity === 'composer', ' must be instantiated using composer()');
    internals.promiseGroup = 'general';

    sofaInternals.promise.register(internals.promiseGroup)
        .promises([

            // test

            {
                name: 'test',
                group: internals.promiseGroup,
                comment: 'test promise comments ',
                handler: function (params) {

                    internals.context = this;

                    return new Promise( function (resolve, reject) {

                            var err = params.err;
                            var result = 'test promise returning data haha!!';
                            // console.log('promise received param : ' + JSON.stringify(params));
                            // console.log('credentials : ' + JSON.stringify(sofaInternals.credentials));

                            if (err) {
                                reject(err);
                            }

                            // promise resolved
                            resolve(result);

                        });
                }
            }
        ]);
};
