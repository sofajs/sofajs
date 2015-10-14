var Sofa = require('../lib');
var Compose = require('./sofafest');

var internals = {};

internals.DB = Sofa.init(Compose.manifest, Compose.composeOptions);

console.log('\n\033[34mexecute requests from outside work\033[0m');

// console.log(JSON.stringify(internals.DB.requests.user.test('hello test')));

internals.DB.requests.user.test('test1 parameter sent', function (err, result) {

    // async call to sofa.requests

    console.log('callback test executed: ' + result);

    internals.DB.requests.user.test2('test2 parameter sent', 'options sent for test2', function (err, result2) {

        console.log('callback test2 executed: ' + result);
    });

});

var documentToInsert = { name: 'insert test2 doc', comment: 'plodding along to the finish2' };

internals.DB.requests.user.test4(documentToInsert, function (err, result) {

    console.log('test4 cb: err: ' + err);
    console.log('test4 cb: result: ' + JSON.stringify(result));
    console.log('++' + JSON.stringify(internals.DB.requests.user));
});

var documentToInsert2 = { name: 'waka doc', comment: 'ploding along' };
var documentId = 'wakawaka';

internals.DB.requests.user.insertid(documentToInsert2, documentId, function (err, result) {

    console.log('insertid cb: err: ' + err);
    console.log('insertid cb: result: ' + JSON.stringify(result));
    // console.log('++' + JSON.stringify(internals.DB.requests.user));
});

