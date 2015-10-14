var Sofa = require('../lib');
var Compose = require('./sofafest');

var internals = {};

internals.DB = Sofa.init(Compose.manifest, Compose.composeOptions);

internals.DB.reload(function (err, response) {

    console.log('err: '+ err);
    console.log('response: '+ response);

});
