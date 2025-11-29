const express = require("express");
const router = express.Router();

require("dotenv").config();
const request = require("request");
const util = require('util');
const requestGet = util.promisify(request.get);
const axios = require("axios");
const querystring = require("querystring");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");

const db = require("./firebase");
const { collection, getDocs, updateDoc, doc, setDoc, deleteDoc, getDoc } = require("firebase/firestore");

const port = process.env.PORT || 5001;
const API = process.env.API_URL || `http://127.0.0.1:${port}`;
const client_id = process.env.CLIENT_ID; // Your clientId
const client_secret = process.env.CLIENT_SECRET; // Your secret
const redirect_uri = `${API}/spotify/callback`; // Your redirect uri

const stateKey = "spotify_auth_state";

const generateRandomString = (length) => {
  return crypto.randomBytes(60).toString("hex").slice(0, length);
};

router.use(cookieParser());

router.get("/login", function (req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = "user-read-private user-read-email user-top-read user-library-read";
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
      })
  );
});

router.get("/callback", function (req, res) {
  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect(
      "/#" +
        querystring.stringify({
          error: "state_mismatch",
        })
    );
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: "https://accounts.spotify.com/api/token",
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: "authorization_code",
      },
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          new Buffer.from(client_id + ":" + client_secret).toString("base64"),
      },
      json: true,
    };

    request.post(authOptions, async function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token,
          refresh_token = body.refresh_token;

        var options = {
          url: "https://api.spotify.com/v1/me",
          headers: { Authorization: "Bearer " + access_token },
          json: true,
        };

        // use the access token to access the Spotify Web API
        const userInfoResponse = await requestGet(options);
        const userInfo = userInfoResponse.body;

        // update firebase user info
        const userDocRef = doc(db, "users", userInfo.id);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userDocData = userDocSnap.data();
          const updatedData = {
            "isPublic": userDocData.isPublic !== undefined ? userDocData.isPublic : true,
            "username": userDocData.username || userInfo.display_name,
            "spotify-data": userInfo
          };
          await setDoc(userDocRef, updatedData, { merge: true });
        } else {
          const newData = {
            "isPublic": true,
            "username": userInfo.display_name,
            "spotify-data": userInfo
          };
          await setDoc(userDocRef, newData);
        }

        await storeLikedTracks(access_token, userInfo.id);
        await storeTopTracks(access_token, userInfo.id);
        await storeTopArtists(access_token, userInfo.id);

        // we can also pass the token to the browser to make requests from there
        res.redirect(
          "http://localhost:5173/profile?" +
            querystring.stringify({
              access_token: access_token,
              refresh_token: refresh_token,
              id: userInfo.id
            })
        );
      } else {
        res.redirect(
          "http://localhost:5173/" +
            querystring.stringify({
              error: "invalid_token",
            })
        );
      }
    });
  }
});



router.get("/refresh_token", function (req, res) {
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: "https://accounts.spotify.com/api/token",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        new Buffer.from(client_id + ":" + client_secret).toString("base64"),
    },
    form: {
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    },
    json: true,
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token,
        refresh_token = body.refresh_token;
      res.send({
        access_token: access_token,
        refresh_token: refresh_token,
      });
    }
  });
});

router.get('/user-info', (req, res) => {
    const accessToken = req.query.access_token;
  
    if (!accessToken) {
      return res.status(400).json({ error: 'Access token is required' });
    }
  
    const options = {
        url: "https://api.spotify.com/v1/me",
        headers: { Authorization: "Bearer " + accessToken },
        json: true,
    };
  
    request.get(options, (error, response, body) => {
      if (error) {
        return res.status(500).json({ error: 'Failed to fetch user data' });
      }
      res.status(200).json(body);
    });
});

router.get('/liked-tracks', (req, res) => {
  const accessToken = req.query.access_token;

  if (!accessToken) {
    return res.status(400).json({ error: 'Access token is required' });
  }

  const options = {
      url: "https://api.spotify.com/v1/me/tracks",
      headers: { Authorization: "Bearer " + accessToken },
      json: true,
  };

  request.get(options, (error, response, body) => {
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch users liked songs' });
    }
    // console.log("liked-tracks", body);
    // console.log("liked-tracks", body);
    res.status(200).json(body);
  });
});

function pruneSongs(song) {
  let newSong = {"id": song['id'], "href": song['href'], "name": song['name'], "uri": song['uri']}
  newSong["artists"] = song["artists"];
  newSong["images"] = song["album"]["images"];
  newSong["external_urls"] = song["album"]["external_urls"];
  return newSong;
}

async function storeLikedTracks(accessToken, id) {
  if (!accessToken) {
    return res.status(400).json({ error: 'Access token is required' });
  }

  const options = {
      url: "https://api.spotify.com/v1/me/tracks",
      headers: { Authorization: "Bearer " + accessToken },
      json: true,
  };
  request.get(options, async (error, response, body) => {
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch users liked songs' });
    }
    let likedSongs = [];
    body["items"].forEach((song) => {
      song = song["track"];
      likedSongs.push(pruneSongs(song));
    })
    await updateDoc(doc(db, "users", id), {"liked-tracks": likedSongs})
  });
}

/* 
  Getting a user's top tracks
*/
router.get('/top-tracks', (req, res) => {
    const accessToken = req.query.access_token;
    const timeRange = req.query.time_range || 'medium_term';

  
    if (!accessToken) {
      return res.status(400).json({ error: 'Access token is required' });
    }
  
    const options = {
      url: `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}`,
      headers: { 'Authorization': 'Bearer ' + accessToken },
      json: true
    };

  
    request.get(options, (error, response, body) => {
      if (error) {
        return res.status(500).json({ error: 'Failed to fetch top tracks' });
      }
      res.status(200).json(body);
    });
});

async function storeTopTracks(accessToken, id) {
  if (!accessToken) {
    return res.status(400).json({ error: 'Access token is required' });
  }

  const options = {
    url: 'https://api.spotify.com/v1/me/top/tracks',
    headers: { 'Authorization': 'Bearer ' + accessToken },
    json: true
  };

  request.get(options, async (error, response, body) => {
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch top tracks' });
    }
    let newSongs = [];
    body["items"].forEach((song) => {
      newSongs.push(pruneSongs(song))
    })
    await updateDoc(doc(db, "users", id), {"top-tracks": newSongs})
  });
}

router.get('/top-artists', (req, res) => {
    const accessToken = req.query.access_token;
    const timeRange = req.query.time_range || 'medium_term';
  
    if (!accessToken) {
      return res.status(400).json({ error: 'Access token is required' });
    }
    const options = {
      url: `https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}`,
      headers: { 'Authorization': 'Bearer ' + accessToken },
      json: true
    };
  
    request.get(options, (error, response, body) => {
      if (error) {
        return res.status(500).json({ error: 'Failed to fetch top artists' });
      }
      res.status(200).json(body);
    });
});

async function storeTopArtists(accessToken, id) {
  if (!accessToken) {
    return res.status(400).json({ error: 'Access token is required' });
  }

  const options = {
    url: 'https://api.spotify.com/v1/me/top/artists',
    headers: { 'Authorization': 'Bearer ' + accessToken },
    json: true
  };

  request.get(options, async (error, response, body) => {
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch top artists' });
    }
    // console.log("top artists", body);
    await updateDoc(doc(db, "users", id), {"top-artists": body["items"]})
  });
}


router.get('/artist', (req, res) => {
    const accessToken = req.query.access_token;
    const artistId = req.query.artistId
  
    if (!accessToken) {
      return res.status(400).json({ error: 'Access token is required' });
    }
  
    const options = {
      url: `https://api.spotify.com/v1/artists/${artistId}`,
      headers: { 'Authorization': 'Bearer ' + accessToken },
      json: true
    };
  
    request.get(options, (error, response, body) => {
      if (error) {
        return res.status(500).json({ error: `Failed to fetch artist info with id ${artistID}`});
      }
      res.status(200).json(body);
    });
});

// router.delete("/logout/:id", async (req, res) => {
//   try {
//     console.log(req.params);
//     const id = req.params.id;
//     const userDoc = (await getDoc(doc(db, "users", id))).data();
//     delete userDoc["liked-tracks"];
//     delete userDoc["spotify-data"];
//     delete userDoc["top-artists"];
//     delete userDoc["top-tracks"];
//     await setDoc(doc(db, "users", id), userDoc);
//     res.status(200).json({message: `Successfully logged out`})
// } catch (e) {
//     res.status(400).json({ error: e.message });
// }
// })
module.exports = router;
