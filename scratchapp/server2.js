var express = require('express');
var bodyParser = require('body-parser')

var app = express();
app.use(bodyParser.json());       // to support JSON-encoded bodies

var Firebase = require("firebase");
var rootRef = new Firebase('https://scratchapp.firebaseio.com/');



app.use('/', express.static(__dirname + '/public'));

app.post('/request', function(req, res) {
	console.log('recieved song request for session: ' + req.body.session + ': ' + req.body.song);
	var songRef = rootRef.child(req.body.session + '/songs');
	songRef.push({
		user: req.body.user,
		song: req.body.song
	});
	res.status(200).end();
 
});

app.post('/skip', function(req, res) {
	console.log('recieved skip request for session: ' + req.body.session + ': ' + req.body.song);
	//if skip exceeds some threshhold, then foward skip request to host
});
/**
app.set('port', process.env.PORT || 3000);
var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});
*/

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});

