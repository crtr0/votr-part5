var config = require('../config')
  , twilio = require('twilio')
  , sessions = require('../models/sessions')
  , events
  , io;

module.exports = function(socketio) {
  io = socketio;
  events = require('../models/events')(io);
  return exports;
};

/**********************************************
 Some simple utility functions 
 *********************************************/
var smsify = function(str) {
  if (str.length <= 160) { return str; }
  else { return str.substr(0,157)+'...'; }
}

, initcap = function(str) {
    return str.substring(0,1).toUpperCase() + str.substring(1);
  }

, testint = function(str) {
    var intRegex = /^\d+$/;
    if(intRegex.test(str)) {
      return true;
    }
    return false;
}

, formatPhone = function(phonenum) {
    var regexObj = /^(?:\+?1[-. ]?)?(?:\(?([0-9]{3})\)?[-. ]?)?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (regexObj.test(phonenum)) {
        var parts = phonenum.match(regexObj);
        var phone = "";
        if (parts[1]) { phone += "(" + parts[1] + ") "; }
        phone += parts[2] + "-" + parts[3];
        return phone;
    }
    else {
        //invalid phone number
        return phonenum;
    }
}

/**********************************************
 The application routes 
 *********************************************/

, admin = exports.admin = function(req, res) {
    var username = sessions.getLoggedInUser(req.cookies['AuthSession']);
    res.render('admin', {username: username});
  }

, getEvent = exports.getEvent = function(req, res){
    events.findBy('all', {key: ['event:'+req.params.shortname], reduce:false}, function(err, event) {
      if (event) {
        events.voteCounts(event, function (err) {
          if (err) {
            console.log(err);
            res.send(500, err);
          }
          else {
            res.render('event', {
              name: event.name, shortname: event.shortname, state: event.state,
              phonenumber: formatPhone(event.phonenumber), voteoptions: JSON.stringify(event.voteoptions)   
            });
          }
        });
      }
      else {
        res.send(404, 'We could not locate your event');
      }
    });
  }

, getEventById = exports.getEventById = function(req, res){
    events.findBy('all', {key: [req.params.id], reduce:false}, function(err, event) {
      if (err) {
        res.send(404, 'We could not locate your event');
      }
      else {
        res.send(JSON.stringify(event));
      }
    });
  }

, saveEvent = exports.saveEvent = function(req, res) {
    events.save(req.cookies['AuthSession'], req.body, function(err, body) {
      if (err) {
        console.log(err);
        res.send(500, JSON.stringify({error: true}));
      }
      else {  
        // update the doc revision
        req.body._rev = body.rev;
        res.send(req.body);
      }
    });
  }

, destroyEvent = exports.destroyEvent = function(req, res) {
    events.destroy(req.cookies['AuthSession'], req.params.id, req.query.rev, function(err, body) {
      if (err) {
        console.log(err);
        res.send(500, JSON.stringify({error: true}));
      }
      else {
        res.send(200, "OK");
      }
    });
  }

, getEventList = exports.getEventList = function(req, res) {
    events.list(req.cookies['AuthSession'], function(err, list) {
      if (err) {
        res.send(401, JSON.stringify({error: true}));
      }
      else {
        res.send(list);
      }
    });
  }

, login = exports.login = function(req, res) {
    sessions.login(req.body.username, req.body.password, function(err, cookie) {
      if (err) {
        res.send(401, JSON.stringify({error: true}));
      }
      else {
        res.cookie(cookie);
        res.send(req.body);
      }
    });
  }

, logout = exports.logout = function(req, res) {
    sessions.removeLoggedInUser(req.cookies['AuthSession']);
    res.clearCookie('AuthSession');
    res.send(200, "OK");
  }
/*
 * POST new vote via SMS
 */

, voteSMS = exports.voteSMS = function(request, response) {

    if (twilio.validateExpressRequest(request, config.twilio.key) || config.twilio.disableSigCheck) {
        response.header('Content-Type', 'text/xml');
        var body = request.param('Body').trim();
        
        // the number the vote it being sent to (this should match an Event)
        var to = request.param('To');
        
        // the voter, use this to keep people from voting more than once
        var from = request.param('From');

        events.findByPhonenumber(to, function(err, event) {
            if (err) {
                console.log(err);
                // silently fail for the user
                response.send('<Response></Response>'); 
            }
            else if (event.state == "off") {
                response.send('<Response><Sms>Voting is now closed.</Sms></Response>');                 
            }
            else if (!testint(body)) {
                console.log('Bad vote: ' + event.name + ', ' + from + ', ' + body);
                response.send('<Response><Sms>Sorry, invalid vote. Please text a number between 1 and '+ event.voteoptions.length +'</Sms></Response>'); 
            } 
            else if (testint(body) && (parseInt(body) <= 0 || parseInt(body) > event.voteoptions.length)) {
                console.log('Bad vote: ' + event.name + ', ' + from + ', ' + body + ', ' + ('[1-'+event.voteoptions.length+']'));
                response.send('<Response><Sms>Sorry, invalid vote. Please text a number between 1 and '+ event.voteoptions.length +'</Sms></Response>'); 
            } 
            else { 
                var vote = parseInt(body);
                events.saveVote(event, vote, from);
                console.log('Accepting vote: ', event.name, from, vote);
                response.send('<Response></Response>');   
            } 
        }); 
    }
    else {
        response.status(403).render('forbidden');
    }
}

, voteVoice = exports.voteVoice = function(request, response) {
    if (twilio.validateExpressRequest(request, config.twilio.key) || config.twilio.disableSigCheck) {
        response.header('Content-Type', 'text/xml');
        response.render('voice');
    }
    else {
        response.status(403).render('forbidden');
    }
}

, voiceSelection = exports.voiceSelection = function(request, response) {
    if (twilio.validateExpressRequest(request, config.twilio.key) || config.twilio.disableSigCheck) {
        response.header('Content-Type', 'text/xml');
        var digits = request.param('Digits').trim();
        
        // the number the vote it being sent to (this should match an Event)
        var to = request.param('To');
        
        // the voter, use this to keep people from voting more than once
        var from = request.param('From');

        console.log("Voice vote coming in: ", to, from, digits);

        events.findByPhonenumber(to, function(err, event) {
            if (err) {
                console.log('ERROR: Could not locate event for number:', to);
                response.send('<Response><Say>Error: could not locate event. Goodbye.</Say></Response>'); 
            }
            else if (event.state == "off") {
                response.send('<Response><Say>Voting is now closed. Goodbye.</Say></Response>');                 
            }
            else if (parseInt(digits) <= 0 || parseInt(digits) > event.voteoptions.length) {
                console.log('Bad voice vote:', event.name, from, digits, ('[1-'+event.voteoptions.length+']'));
                response.send('<Response><Say>Sorry, invalid vote. Please enter a number between 1 and '+ event.voteoptions.length +'</Say><Redirect method="POST">/vote/voice</Redirect></Response>'); 
            } 
            else {                
                var vote = parseInt(digits);
                console.log('Accepting voice vote:', event.name, from, digits);
                    
                events.saveVote(event, vote, from);
                response.send('<Response><Say>We are processing your vote. You will recieve a text message confirmation. Goodbye.</Say></Response>');
            }  
        }); 
        
    }
    else {
        response.render('forbidden');
    }
};

