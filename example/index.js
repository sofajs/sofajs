var Sofa = require('../lib');
var Compose = require('./sofafest');

var internals = {};

internals.DB = Sofa.init(Compose.manifest, Compose.composeOptions);

console.log('\n\033[34mexecute requests from outside work\033[0m');

// console.log(JSON.stringify(internals.DB.requests.user.test('hello test')));

var documentToInsert = { name: 'waka doc', comment: 'ploding along' };
var documentId = 'wakawaka';

internals.DB.requests.user.insertid(documentToInsert, documentId, function (err, result) {

    console.log('insertid cb: err: ' + err);
    console.log('insertid cb: result: ' + JSON.stringify(result));
    // console.log('++' + JSON.stringify(internals.DB.requests.user));
});

internals.DB.requests.user.getByEmail('js@dali.photo', function (err, result) {

    console.log('getByEmail result count: ' + result.rows.length);
    console.log('user.getByEmail cb: err: ' + err);
    console.log('user.getByEmail cb: result: ' + JSON.stringify(result));
    // console.log('++' + JSON.stringify(internals.DB.requests.user));
});

