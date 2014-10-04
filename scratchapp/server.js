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
	var dj_id = req.body.dj_id;
	console.log(dj_id);
	var track_id = req.body.track_id;
	console.log(track_id);
	var track = rootRef.child(dj_id).child("songs").child(track_id);

	track.once('value', function(snapshot) {
		var exists = (snapshot.val() !== null);
		if (exists) {
			console.log("Removing song from the database.");
		    track.remove();
		    res.status(200).end();
		} else {
			console.log("The track does not exist");
			res.status(409).end();
		}
	});
});



//USER STUFF
app.get('/api/tracks', function(req, res) {

	var dj_id = req.body.dj_id;
	var track = req.body.track;
	var kid = rootRef.child(req.body.dj_id);

	kid.once('value', function(snapshot) {
		var exists = (snapshot.val() !== null);
		if (exists) {
			console.log("Exists");
			var songs = kid.child("songs");
			songs.push({song_data: track, counter: 1});
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

app.post('/api/tracks', function(req, res) {
	var dj_id = req.body.dj_id;
	var songs = rootRef.child(dj_id).child("songs");
	songs.on('child_added', function(snapshot) {
		var song = snapshot.val();
		console.log(song.name());
		res.status(200).end();
	});
});

app.put('/api/tracks', function(req, res) {
	var dj_id = req.body.dj_id;
	var track_id = req.body.track_id;
	var trackRef = rootRef.child(dj_id).child("songs").child(track_id);
	var val = trackRef.child('counter');
	val.transaction(function(currentRank) { 
		return currentRank+1;
	}, function(error, committed, snapshot) {
		if (error) {
			console.log('Transaction failed abnormally!', error);
		} else if (!committed) {
			console.log("fail to increment the counter");
			res.status(409).end();
		} else {
			console.log('counter incremented');
			res.status(200).end();
		}
	});
});


var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});
