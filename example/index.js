var Sofa = require('../lib');
var Compose = require('./sofafest');

var internals = {};

internals.DB = Sofa.init(Compose.manifest, Compose.composeOptions);

var sofaInternalsclone = internals.DB.getSofaInternals();

console.log('\n\033[34mexecute requests from outside work\033[0m');

sofaInternalsclone.tools.core.test({ test: 'param sent' });

// console.log('docs.tools.core: ' + JSON.stringify(sofaInternalsclone.docs.tools.core));



// console.log(JSON.stringify(internals.DB.requests.user.test('hello test')));

internals.DB.requests.user.test('test1 parameter sent', function (err, result) {

    console.log('callback executed' + result);
});

internals.DB.requests.user.test2('test2 parameter sent', 'options sent for test2', function (err, result) {

    console.log('callback test2 executed' + result);
});

internals.DB.requests.user.test3(function (err, result) {

    console.log('callback test3 executed' + result);
});

internals.DB.requests.user.test4();

internals.DB.requests.user.getuser('userid', function (err, result) {

    console.log('get user callback called: ' + result);
});

