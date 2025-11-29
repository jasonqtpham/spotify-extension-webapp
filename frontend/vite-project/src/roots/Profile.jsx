import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../components/AuthContext";
import axios from "axios";
import "../styles/Profile.css";
import "../styles/Topartists.css";
import "../styles/Discover.css";
import mockphoto from '../images/mockprofilephoto.png';
const API = import.meta.env.VITE_API_URL || "http://localhost:5001";
export const Profile = () => {
  const { userData } = useContext(AuthContext);
  const [topArtists, setTopArtists] = useState([]);
  const [topSongs, setTopSongs] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const accessToken = localStorage.getItem("access_token");
  const userId = localStorage.getItem("id");
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState();
  const [editUsername, setEditUsername] = useState();
  const items = 5;
  const [isPublicProfile, setIsPublicProfile] = useState(false);

  useEffect(() => {
    if (accessToken) {
      fetchData();
    }
  }, [accessToken]);

  const handleConfirm = async () => {
    try {
      await axios.put(`${API}/public-profile/update-name/${userId}`,
        { username: editUsername }
      );
      setUsername(editUsername);
    } catch (e) {
      console.log(e);
    }
    setEditing(false);
  };

  const handlePublicPrivateProfile = () => {
    setIsPublicProfile(!isPublicProfile);
    setPublicPrivateProfile(!isPublicProfile);
  };

  const setPublicPrivateProfile = async (isPublicProfile) => {
    try {
      await axios.put(`${API}/public-profile/update-ispublic/${userId}`,
        { ispublic: isPublicProfile }
      );
    } catch (e) {
      console.log(e);
    }
  };

  const fetchData = async () => {
    try {
      let response;

      response = await axios.get(`${API}/spotify/top-artists`,
        {
          params: { access_token: accessToken, time_range: "medium_term" },
        }
      );
      setTopArtists(response.data.items.slice(0, items));

      response = await axios.get(`${API}/spotify/top-tracks`, {
        params: { access_token: accessToken, time_range: "medium_term" },
      });
      setTopSongs(response.data.items.slice(0, items));

      response = await axios.get(`${API}/spotify/liked-tracks`,
        {
          params: { access_token: accessToken },
        }
      );
      setLikedSongs(response.data.items.slice(0, items));

      response = await axios.get(`${API}/spotify/user-info`, {
        params: { access_token: accessToken },
      });
      setUser(response.data);
      console.log("userdata", response.data);

      response = await axios.get(`${API}/public-profile/${userId}`
      );
      setUsername(response.data.username);
      setEditUsername(response.data.username);
      setIsPublicProfile(response.data.isPublic);
      console.log(response.data.isPublic);
      setLoading(false);
    } catch (e) {
      console.error("Error fetching data", e);
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <div className="loader" />
      ) : (
        <>
          <div className="content-container"></div>

          {user && (
            <div className="profile">
              <img
                src={
                  user.images && user.images[1]
                    ? user.images[1].url
                    : mockphoto
                }
                alt="user-image"
                className="artist"
              />
              <div>
                <p style={{ color: "white", fontSize: "1.5em" }}>Profile</p>

                {editing ? (
                  <div className="edit-box">
                    <input
                      type="text"
                      className="edit-field"
                      placeholder="Username"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                    />
                    <div className="button-group">
                      <button
                        className="confirm-button"
                        onClick={handleConfirm}
                      >
                        Confirm
                      </button>
                      <button
                        className="cancel-button"
                        onClick={() => {
                          setEditUsername(username);
                          setEditing(false);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="username-box">
                    <a
                      style={{ textDecoration: "none" }}
                      target="_blank"
                      rel="noopener noreferrer"
                      href={user.external_urls.spotify}
                    >
                      <h1>{username}</h1>
                    </a>
                    <button
                      className="edit-button"
                      onClick={() => {
                        setEditing(true);
                      }}
                    >
                      <i className="gg-pen"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="profile-switch">
            <h3 className="isPublicText">Public Profile?</h3>
            <label className="switch">
              <input
                className="slidercontainer"
                type="checkbox"
                checked={isPublicProfile}
                onChange={handlePublicPrivateProfile}
              />
              <span className="slider round"></span>
            </label>
          </div>
          <hr className="solid" />
          <div className="content-container">
            <h1 style={{ color: "white" }}>Top Songs</h1>
          </div>

          <div id="top-artist-grid">
            {topSongs.length > 0 ? (
              topSongs.map((song) => (
                <div className="card-button-wrapper" key={song.id}>
                  <a
                    href={song.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <button className="artist-button">
                      <div className="top-artist">
                        <img
                          src={song.album.images[0].url}
                          className="song"
                          alt={song.name}
                        />
                        <p>{song.name}</p>
                      </div>
                    </button>
                  </a>
                </div>
              ))
            ) : (
              <h3>No top songs available</h3>
            )}
          </div>

          <div className="content-container">
            <h1 style={{ color: "white" }}>Top Artists</h1>
          </div>

          <div id="top-artist-grid">
            {topArtists.length > 0 ? (
              topArtists.map((artist) => {
                const artistImage =
                  artist.images && artist.images[0]
                    ? artist.images[0].url
                    : "../../public/spotify-default.jpg";
                return (
                  <div className="card-button-wrapper" key={artist.id}>
                    <a
                      href={artist.external_urls.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <button className="artist-button">
                        <div className="top-artist">
                          <img
                            src={artistImage}
                            className="artist"
                            alt={artist.name}
                          />
                          <p>{artist.name}</p>
                        </div>
                      </button>
                    </a>
                  </div>
                );
              })
            ) : (
              <h3>No top artists available</h3>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default Profile;
