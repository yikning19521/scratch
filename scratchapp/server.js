var express = require('express');
var bodyParser = require('body-parser')

var app = express();
app.use(bodyParser.json());       // to support JSON-encoded bodies

var Firebase = require("firebase");
var rootRef = new Firebase('https://scratchapp.firebaseio.com/');

var displayNum = 10;


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
	var dj_id = req.body.dj_id;
	var songs = rootRef.child(dj_id).child("songs");
	/** See below. */
	number_elements(songs, dj_id, res);
});

app.delete('/api/dj', function(req,res) {
	var dj_id = req.body.dj_id;
	var track_id = req.body.track_id;
	if (track_id != null) {
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
	} else {
		var djRef = rootRef.child(dj_id);
		djRef.once('value', function(snapshot) {
			var exists = (snapshot.val() !== null);
			if (exists) {
				console.log("Removing the dj " + dj_id + " from the database.");
				djRef.remove();
				res.status(200).end();
			} else {
				console.log("This DJ does not exist.");
				res.status(409).end();
			}
		});
	}
		
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
			songs.push({song_data: track, counter: 1});
			res.status(200).end();
		} else {
			console.log("DNE");
			res.status(409).end();
		}
	});

});


app.get('/api/tracks', function(req, res) {
	var dj_id = req.body.dj_id;
	var songs = rootRef.child(dj_id).child("songs");
	number_elements(songs, dj_id, res);
});

function number_elements(elems, dj_id, res) {
	elems.on('value', function(snapshot) {
		var number = snapshot.numChildren();
		set_track_list(elems, number, dj_id, res);
	});
}

function set_track_list(songs, num, dj_id, res) {
	var counter = 0;
	var lst = [];
	songs.on('child_added', function(snapshot) {
		if ((counter < displayNum) && (counter < num)) {
			var song_id = snapshot.name();
			var skip_count = snapshot.child('counter').val();
			var song_data = snapshot.child('song_data').val();
			var curr_track = { "_id": song_id, "dj_id": dj_id, "track" : song_data, "skip_count": skip_count };
			lst.push(curr_track);
		}
		counter += 1;
		if ((counter == displayNum) || (counter == num)) {
			res.status(200);
			res.send({ "tracks" : JSON.parse(JSON.stringify(lst)) });
			
		}		
	});
}



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
