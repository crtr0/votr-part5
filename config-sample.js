var config = {};

config.couchdb = {};
config.twilio = {};

config.couchdb.url = 'https://couchserver:port/database';
config.couchdb.secureUrl = 'https://username:password@couchserver:port/database';
config.couchdb.secondsToInvalidateEvents = 120;
config.couchdb.secondsToFlushVotes = 10;

config.twilio.sid = 'ACxxx';
config.twilio.key = 'yyy';
config.twilio.smsWebhook = 'https://nodeserver/vote/sms';
config.twilio.voiceWebhook = 'https://nodeserver/vote/voice';
config.twilio.disableSigCheck = false;

config.cookiesecret = 'make-this-a-secret';

module.exports = config;
