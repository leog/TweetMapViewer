
/**
 * Module dependencies.
 */

var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , routes = require('./routes')
  , io = require('socket.io').listen(server)
  , path = require('path')
  , twitter = require('ntwitter');


app.configure(function(){
  app.set('port', process.env.PORT || 5000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

app.get('/', routes.index);

/*Setup your Twitter keys here*/
var twit = new twitter({
    consumer_key: 'CONSUMER_KEY_HERE',
    consumer_secret: 'CONSUMER_SECRET_HERE',
    access_token_key: 'ACCESS_TOKEN_KEY_HERE',
    access_token_secret: 'ACCESS_TOKEN_SECRET_HERE'
});

var criteria = ['-74,40,-73,41']; //<-- filter by location(s) (ex: New York)
//var criteria=['this','that']; //<-- filter by term(s) (ex: this OR that)

twit.stream('statuses/filter', { locations: criteria }, function(stream) { // possibilities {track: criteria} OR {locations: criteria}
    stream.on('data', function (data) {
        var geo=false,latitude,longitude;
        if(data.geo!=null){
            geo = true;
            latitude = data.geo.coordinates[0];
            longitude = data.geo.coordinates[1];
        }
        io.sockets.volatile.emit('tweets', {
            user: data.user.screen_name,
            text: data.text,
            geo : geo,
            latitude: latitude,
            longitude: longitude
        });
    });
});
