/**
 * This is an example of a basic node.js script that performs
 * the Client Credentials oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#client_credentials_flow
 */

const express = require('express'); // Express web server framework
const request = require('request'); // "Request" library

const env = process.env.NODE_ENV || 'development';
const config = require('../config')[env];

const client_id = config.clientID; // Your client id
const client_secret = config.clientSecret; // Your secret
const client_str = client_id + ':' + client_secret;

// your application requests authorization
const authOptions = {
  url: 'https://accounts.spotify.com/api/token',
  headers: {
    'Authorization': 'Basic ' + (new Buffer.alloc(client_str.length, client_str).toString('base64'))
  },
  form: {
    grant_type: 'client_credentials'
  },
  json: true
};

var app = express();
app.use(express.static(__dirname + '/public'));

app.get('/search/:artist', function(req, res) {
  let artist = req.params.artist;
  console.log(artist);
  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
  
      // use the access token to access the Spotify Web API
      const token = body.access_token;
      console.log(artist);
      let options = {
        url: 'https://api.spotify.com/v1/search?q=' + artist + '&type=artist',
        headers: {
          'Authorization': 'Bearer ' + token
        },
        json: true
      };
      request.get(options, function(error, response, body) {
        if (body.artists === undefined) {
          res.send({});
          return;
        }
        const artists = body.artists;
  
        let items = [];
        if (artists === undefined) {
          res.send({});
          return;
        }
        items = artists.items;
  
        if (items == undefined || items.length === 0) {
          res.send({})
          return;  
        }
  
        let artistID = items[0].id;
          options.url = 'https://api.spotify.com/v1/artists/' + artistID + '/related-artists';
          request.get(options, function(error, response, body) {
            let relatedArtists = body.artists;
            res.send({
              'relatedArtists': relatedArtists
            });
            console.log(relatedArtists);
          });
      });
    }
  });
});

console.log('Listening on 8888');
app.listen(8888);