# sofajs

### CouchDB request builder.

Still building -- not ready for production.

Build couchdb request logic using sofajs which loads all requests into a 
requests object for easy consumption within your application. Plus, documentation is 
generated for all requests supporting gfm.    

#### Designs
A core concept of couchDB is orgnizing and searching your data using designs documents.
sofajs supports the construction of views and update functions and generates design 
documents for you. Plus, the design document builder logic supports the loading of 
fixture data for each design document.
* [Intro To Views](http://docs.couchdb.org/en/1.6.1/couchapp/views/intro.html)
* [CouchDB Design Functions](http://docs.couchdb.org/en/1.6.1/couchapp/ddocs.html)

#### DB Connections
sofajs uses [nano](https://github.com/dscape/nano) when making couchdb requests
and a database connection is guaranteed before the request is executed. 
And, nano's database methods can be accessed using: `sofaInternals.db` object. 


### Three types of methods 
sofajs provides tools to build three types of methods: requests, tools, and promises.
* database **requests**  methods\n
  methods that your nodejs application  will use when making a request to CouchDB. 
  Accessible to externally to be used by applications consuming the object. 
* **tools** or helper methods\n 
  These are helper methods used inside database request methods. They are not accessible
  applications consuming the sofajs object.
* **promises** methods\n
  Promises functions stored in sofajs object.

### Grouping of methods
methods are grouped by lables you create. For example, a group named 'user' could be
created and the sofajs object would have: 
* sofaInternals.requests.user\n
  all request methods build for the user group would be in the 
  `sofaInternals.requests.user` object.
* sofaInternals.tools.user\n
  all tool methods built for the user group would be in the 
  `sofaInternals.tools.user` object.
* sofaInternals.promises.user\n
  all promise methods built for the user group would be in the 
  `sofaInternals.promises.user` object.
