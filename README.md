# sofajs

### not ready for production -- test coverage 88%.

Build couchdb request logic using sofajs which loads all requests into a 
requests object for easy consumption within your application. Plus, documentation is 
generated for all requests supporting gfm.    

### Install 
`npm install sofajs`

### See it in action 
* clone project from git.<br/>
  `git clone https://github.com/sofajs/sofajs.git`<br/>
  `cd sofajs && npm install`

* configure ./example/sofafest.js <br/>
  set the database user configurations to match your couchdb setup. 
* run docserver <br/>
  `npm run docos`<br/>
  This will use example project in ./example folder to generate docs.  <br/>
  view `localhost:9000` and see example api docs.
  
### See current test status 
`npm run load`  This will load/reload designs and fixture data.<br/>
`npm test`  88% coverage


### Why sofajs?
While planning for a [hapijs](http://hapijs.com) project which used CouchDB saw something like sofajs was needed
so decided to build it. 

### Designs
A core concept of couchDB is orgnizing and searching your data using design documents.
sofajs supports the construction of views and update functions and generates design 
documents for you. Plus, the design document builder logic supports the loading of 
fixture data for each design document. 
* [Intro To Views](http://docs.couchdb.org/en/1.6.1/couchapp/views/intro.html)
* [CouchDB Design Functions](http://docs.couchdb.org/en/1.6.1/couchapp/ddocs.html)

### DB Connections
sofajs uses [nano](https://github.com/dscape/nano) when making couchdb requests.
A database connection is guaranteed before requests are executed. 
And, nano's database methods can be accessed using: `sofaInternals.db` object. 

### Three types of methods 
sofajs provides tools to build three types of methods: requests, tools, and promises.
* database **requests**  methods<br/>
  methods your application  will consume to make couchdb queries. 
  Requests are accessible externally for consumption by other applications. 
  #### Important:
    - **requests** methods accept a maximum of three parameters. 
      Plan to expand support for more parameters later.
* **tools** or helper methods<br/> 
  These are helper methods used inside database request methods. They are not accessible
  applications consuming the sofajs object.
* **promises** methods<br/>
  Promises functions stored in sofajs object.
  Found that promises often are reused many times in various locations 
  of an application. So, created a space to locate promises in groups for easy reuse.
  Technically,  tools could be promises too.

### Grouping of methods
methods are grouped by lables you create. For example, a group named 'user' could be
created and the sofajs object would have: 
* sofaInternals.requests.user<br/>
  all request methods build for the user group would be in the 
  `sofaInternals.requests.user` object.
* sofaInternals.tools.user<br/>
  all tool methods built for the user group would be in the 
  `sofaInternals.tools.user` object.
* sofaInternals.promises.user<br/>  
  all promise methods built for the user group would be in the 
  `sofaInternals.promises.user` object.

### Documentation Server
supports a documentation server which generates html documenation using 
[hapijs](https://github.com/hapijs).  

### Testing
require 100% test coverage using: [lab](https://github.com/hapijs/lab) and [code](https://github.com/hapijs/code)

`npm run load`  This will load/reload designs and fixture data.<br/>
current test coverage: `npm test`  88% coverage

### Style Guide
Project follows: [hapijs coding conventions](https://github.com/hapijs/contrib/blob/master/Style.md)
