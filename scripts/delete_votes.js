var db = require('nano')(require('../config').couchdb.url);

var docsToDelete = [];
var event_id = process.argv[2];

db.view('event', 'votes', {startkey: [event_id, 0], endkey: [event_id, {}], include_docs: true}, function(err, body) {
  for (var i in body.rows) {
    docsToDelete.push({_id: body.rows[i].doc._id, _rev: body.rows[i].doc._rev, _deleted: true});
    //console.log(body.rows[i].doc._id);
  }
  
  db.bulk({docs: docsToDelete}, function(err, body) {
    console.log(body);
  });
});


