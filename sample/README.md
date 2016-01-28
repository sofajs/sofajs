# Sample sofajs Project 


### Setup 
* Install CouchDB <br/>
  [CouchDB](http://couchdb.apache.org/)
* Create an admin user account for couchdb. 
  [CouchDB Authentication](http://docs.couchdb.org/en/1.6.1/intro/security.html#authentication)
* clone this project.<br/>
  `git clone https://github.com/sofajs/sample.git`
* Install sample application:<br/>
  `cd sample && npm install`
* Configure admin user credentials to be used by sofajs manifest file,<br/> 
  'lib/sofafest.js' of this project the manifest file is named 'sofafest.js'. 
* `npm run load`<br/>
   load fixutures and design functions into couchDB.<br/>
   Run above "load" command twice the first time it is run.
   If database does not exists yet it does not automatically load fixture data.
   Second time round will work.  Eventually, I will fix this issue.
* `npm test` ensure that all tests execute.
* To use in hapijs project place sofajs object in `server.app` property.<br/>
  [server.app](hapijs.com/api#serverapp)

### docos documentation server
`npm run docos` then open the web application in your browser.<br/>
Documentation for all functions written in the sofajs object is in the docos web app.<br/>
Documentation will extend as you write more functions in sofajs.
