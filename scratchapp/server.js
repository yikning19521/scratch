var express = require('express');
var bodyParser = require('body-parser')

var app = express();
app.use(bodyParser.json());       // to support JSON-encoded bodies

var Firebase = require("firebase");
var rootRef = new Firebase('https://scratchapp.firebaseio.com/');



//DJ STUFF
app.post('/api/dj', function(req, res) {

	var dj_id = req.body.dj_id;
	console.log(dj_id);
	var childRef = rootRef.child(dj_id);

	childRef.transaction(function(currentData) {
		if (currentData == null) {
			console.log("New DJ session created.");
			return { name: dj_id };

		} else {
			console.log("DJ session " + dj_id + " already exists.");
			return;
		}
	}, function(error, committed, snapshot) {
		if (error) {
			console.log('Transaction failed abnormally!', error);
		} else if (!committed) {
			console.log('We aborted the transaction (because ' + dj_id + ' already exists).');
			console.log("DJ session " + dj_id + " already exists.");
			res.status(409).end();
		} else {
			console.log('User ' + dj_id + ' added!');;
			res.status(200).end();
		}
	});

});

app.get('/api/dj', function(req, res) {
});

app.delete('/api/dj', function(req,res) {
});



//USER STUFF
app.post('/api/tracks', function(req, res) {

	var dj_id = req.body.dj_id;
	var track = req.body.track;
	var kid = rootRef.child(req.body.dj_id);

	kid.once('value', function(snapshot) {
		var exists = (snapshot.val() !== null);
		if (exists) {
			console.log("Exists");
			var songs = kid.child("songs");
			songs.push({song_data: track});
			res.status(200).end();
		} else {
			console.log("DNE");
			res.status(409).end();
		}
	});

});


function userExistsCallback(userId, exists) {
  if (exists) {
    console.log('user ' + userId + ' exists!');
	return true;
  } else {
    console.log('user ' + userId + ' does not exist!');
	return false;
  }
}
 
// Tests to see if /users/<userId> has any data. 
function checkIfUserExists(userId) {
  var usersRef = rootRef;
  usersRef.child(userId).once('value', function(snapshot) {
    var exists = (snapshot.val() !== null);
    userExistsCallback(userId, exists);
  });
}

app.get('/api/tracks', function(req, res) {
})

app.put('/api/tracks', function(req, res) {
});


/**
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

*/

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});
