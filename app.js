var express = require('express');
var request = require('request');
var Spotify = require('spotify-web-api-node');


var scopes = ['user-read-private', 'user-library-read'],
	clientId = '596d938cb0d24e4fbc2d3fb2c34a94e5',
	clientSecret = 'c3ef04a80ac04ac99c8fab922b750c4f',
	redirectUri = 'http://localhost:8888/callback',
	state = 'spotify_auth_state';

var app = express();

var spotify = new Spotify({
	redirectUri: redirectUri,
	clientId: clientId,
	clientSecret: clientSecret
});

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

app.use('/d3', express.static(__dirname + '/node_modules/d3/dist'));
app.use('/js', express.static(__dirname + 'public/js'));
 
app.get('/login', function(req, res){
	res.redirect(spotify.createAuthorizeURL(scopes,state));
});

app.get('/callback', function(req, res){

	var code = req.query.code || null;

	spotify.authorizationCodeGrant(code).then(
		function(data){
			console.log('Token expires in '+ data.body['expires_in']);
			console.log('Access token: '+ data.body['access_token']);
			console.log('Refresh token: '+ data.body['refresh_token']);

			var access_token = data.body['access_token'],
				refresh_token = data.body['refresh_token'];

			spotify.setAccessToken(access_token);
			spotify.setRefreshToken(refresh_token);

			spotify.getMySavedTracks({
				limit:1,
				offset:0
			}).then(function(data){
				return getAllArtists(data.body.total);
			}).then(processArtists)
			.then(function(data){
				console.log(data);

				res.render('pages/visualize', {
					artists:data
				});

			})
			.catch(function(err){
				console.log(err.message);
			});
		
		}, function (err){
			console.error('Error: '+ err);
			res.redirect('/#' + err);
		});
});

// app.get('/refresh_token', function(req, res){

// 	spotify.refreshAccessToken().then(
// 		function(data){
// 			console.log('Access token refreshed');
// 			access_token = data.body['access_token'];
// 			spotify.setAccessToken(access_token);

// 			res.send({'access_token': access_token});

// 		}, function(err){
// 			console.error("Access token not refreshed: ",err);
// 		});
// });

console.log('Listening on 8888');
app.listen(8888);



//-------------------- FUNCTIONS ---------------------------

function processArtists (userArtists){

	var numArtistsDisplayed = 50;

	console.log("Processing " + userArtists.length + " artists........");
	culledArtists = userArtists.sort(sortArray('count')).slice(0,numArtistsDisplayed);
	
	return culledArtists;
}

function sortArray(property){
	return function(x, y){
		return ((x[property] === y[property]) ? 0 : ((x[property] > y[property]) ? -1 : 1));
	};
}

//FUNCTIONS FOR GETTING ARTISTS

function getAllArtists(numArtists){
	return new Promise(function(fulfill, reject){
				
		var totalTracks = numArtists;
		var tracksProcessed = 0;
		var userArtists = [];

		for (i = 0; i<totalTracks; i += 50){
			getSavedArtists(50, i, userArtists, function(artists){
				userArtists = artists;
				console.log("Tracks: "+ tracksProcessed + "  Artists: " + userArtists.length);
				tracksProcessed += 50;
				if(tracksProcessed > totalTracks){
					fulfill(userArtists);
				}
			});
		}

	});
}

function getSavedArtists(lim, off, aList, callback){

	spotify.getMySavedTracks({
			limit:lim,
			offset: off
		}).then(function(data){
				console.log('------------------------------------------');
				aList = getArtistsFromTracks(data, aList);
				callback(aList);
		}).catch(function(err){
				console.error(err.message);
			});
}

function getArtistsFromTracks(tracks, artistList){

	for (var t in tracks.body.items){
		var track = tracks.body.items[t].track;
		var artist = track.artists[0];
		artistList = pushArtistToList(artist, artistList);
	}
	return artistList;
}

function pushArtistToList(artist, list){

	if(!list.some(i => i.name === artist.name)){
		list.push({"name":artist.name,"id":artist.id,"count":1});
	}

	else{
		list.forEach(function(i){
			if(i.name === artist.name) i.count ++;
		});
	}
	return list;
}



