
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , socketio = require('socket.io')
  , config = require('./config');

var app = express()
  , server = http.createServer(app)
  , io = socketio.listen(server);

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'hjs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.urlencoded());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser(config.cookiesecret));
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});


io.configure('production', function(){
  io.enable('browser client etag');
  io.set('log level', 1);
});

io.configure('development', function(){
  io.set('log level', 1);
});

io.sockets.on('connection', function(socket) {
    socket.on('event', function(event) {
        socket.join(event);
    });
});

var routes = require('./routes')(io);

app.get ('/events/:shortname',    routes.getEvent);
app.post('/vote/sms',             routes.voteSMS);
app.post('/vote/voice',           routes.voteVoice);
app.post('/vote/voice/selection', routes.voiceSelection);

app.get('/admin/', function(req, res) {
  if(process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect('https://' + req.get('Host') + req.url);
  }
  else {
    routes.admin(req, res);
  }
});

app.post  ('/api/sessions',   routes.login);
app.delete('/api/sessions',   routes.logout);
app.get   ('/api/events',     routes.getEventList);
app.get   ('/api/events/:id', routes.getEventById);
app.delete('/api/events/:id', routes.destroyEvent);
app.post  ('/api/events',     routes.saveEvent);

