// var Sofajs = require('../../sofajs/lib');
var Sofajs = require('sofajs');
var Composer = require('../lib/sofafest');

var database = Sofajs.init(Composer.manifest, Composer.composeOptions);

database.requests.user.test(function (err, result) {

    console.log('##boom## result ' + result);
});
