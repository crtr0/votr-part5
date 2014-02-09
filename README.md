#Wrapping Up Votr: AngularJS and CRUD with RESTful APIs

This is the companion repo for the fifth and final part in a series of blog posts about building a real-time SMS and voice voting application using Node.js. It’s been illuminating to walk through the process of building an app that I needed using technologies that I was new to. Let’s take a moment and recap where we’ve been.

In [part one][], we created the Node application and captured incoming votes over SMS and stored them in a CouchDB. I chose to use Express as the web framework and Cloudant and my CouchDB provider.

In [part two][], we created a real-time visualization of the voting using Socket.io and Highcharts. As votes came in a bar chart depicting the current state of the vote would update in realtime. For my purposes (live SMS voting at events) this was my MVP product. But, at larger events I ran into some nasty scaling issues.

In [part three][], we tweaked our app to scale to thousands of votes per second and millions of total votes. This was accomplished by being smarter about how we stored our documents and leveraging CouchDB’s map/reduce capabilities.

In [part four][] we began adding an web front-end for admins using AngularJS. We got added AngularJS to our project and implemented a login and logout flow. I showed you the end-to-end flow of how log-in works: user fills out a form, AJAX request is made to the Node server, HTTP request is made to CouchDB, and the result of the operation is returned up the stack.

The last thing for us to do to complete this admin portion of the application is to use AngularJS to create a simple CRUD interface for the events in our CouchDB. We’re going to focus on the AngularJS code and templates that we’re going to write to edit our event documents. We’ll finish with a brief run-through of the server-side code. But for now just assume that we’re working with a RESTful API, just like in the authentication scenario in Part 4.

[part one]: http://www.twilio.com/blog/2012/09/building-a-real-time-sms-voting-app-part-1-node-js-couchdb.html
[part two]: http://www.twilio.com/blog/2012/12/building-a-real-time-sms-voting-app-part-2-socket-io-and-highcharts-js.html
[part three]: http://www.twilio.com/blog/2013/01/building-a-real-time-sms-voting-app-part-3-scaling-node-js-and-couchdb.html
[part four]: https://www.twilio.com/blog/2013/08/votr-part-4-angularjs-and-authentication-with-couchdb.html


