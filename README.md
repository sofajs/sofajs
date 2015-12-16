# sofajs

sofajs provides a framework to interface with couchdb.
Code is grouped and labelled in three types of modules: requests, tools (helpers), and promises.
This stores all couchdb request logic in a sofajs object and to be conveniently consumed in an application.

Besides the above, sofajs also provides the ability to write and build design logic. 
couchdb view and update design functions built using sofajs' design object are then generated 
using the 'npm run load'. This command also generates the fixture data you may write inside the design object. 
'npm run load' destroys the database, builds a new one, generates the projects design functions, 
and then loads all fixture data. 

If `sofafest.js` is configured to 'live' then 'npm run load' does not destroy the database,  
does not load fixtures and will only reload design functions.  

### Install 
`npm install sofajs`

#### Three types of modules
* **request modules** contain methods exposed to the outside world and are to be consumed by other applications.
tool and promise methods are not exposed and are only to be consumed within the sofajs application.  

* **tool modules** are helper methods to be consumed by the request methods.  
They allow the logic of requests to be separated into other functions and tested. 

* **promise modules** are modules for grouping promises in labelled modules. 
Frequently wrote duplicate or similar promise code which inspired the creation of this type of module. 
It keeps all promises in one place, labelled in groups, and ready for reuse as needed. 

### testing 
another advantage of sofajs and it's module design is easy isolation of functions for testing
making it convenient to write good test coverage. When testing, use the `getInternals()` methods to get access
to tool and promise methods for writing test coverage.  

### docos documentation server  
`https://github.com/sofajs/docos` <br/>
The sofajs request object has a 'comment' member where documentation is written for each function using gfm 
(git flavored markdown). After writing couchdb request logic the sofajs way, execute 'npm run docos' and 
a server starts up displaying a web application containing all the documentation written for each request. 
See sample project for how to configure a project to use docos.

### Extendable 
There is a manifest file which configures how many modules are included in a sofajs project.
In theory there is no limit to how many modules to be added. Plus, the module design allows for development
to be done separately by different developers and combined later if desired.

### DB Connections
sofajs uses [nano](https://github.com/dscape/nano) when making couchdb requests.
A database connection is guaranteed before requests are executed. 
nano's methods are accessed using the `sofaInternals.db` object. 

### See it in action 
* https://github.com/sofajs/sample<br/>
  view this project for examples.
  
### current test status 
`npm run load`  This will load/reload designs and fixture data.<br/>
sometimes may need to run above command twice.<br/>
`npm test`  87% coverage <br/>

### Testing
require 100% test coverage using: [lab](https://github.com/hapijs/lab) and [code](https://github.com/hapijs/code) <br/> 
test coverage 87% <br/>

### Style Guide
Project follows: [hapijs coding conventions](https://github.com/hapijs/contrib/blob/master/Style.md)

### License 
[LICENSE](https://github.com/sofajs/sofajs/blob/master/LICENSE)

### More on Designs
A core concept of couchDB is orgnizing and searching your data using design documents.
sofajs supports the construction of views and update functions and generates design 
documents for you. Plus, the design document builder logic supports the loading of 
fixture data for each design document. 
* [Intro To Views](http://docs.couchdb.org/en/1.6.1/couchapp/views/intro.html)
* [CouchDB Design Functions](http://docs.couchdb.org/en/1.6.1/couchapp/ddocs.html)


