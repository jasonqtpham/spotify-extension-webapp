import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../components/AuthContext";
import axios from "axios";
import "../styles/Topartists.css";
import "../styles/Discover.css";
const API = import.meta.env.VITE_API_URL || "http://localhost:5001";
export const TopArtists = () => {
  const { userData } = useContext(AuthContext);
  const [topArtists, setTopArtists] = useState([]);
  const accessToken = localStorage.getItem("access_token");
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState("medium_term");
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API}/spotify/top-artists`,
          {
            params: { access_token: accessToken, time_range: timeFrame },
          }
        );
        setTopArtists(response.data.items);
        console.log("asdfasdf", response.data.items);
        setLoading(false);
      } catch (e) {
        console.error("Error fetching top artists", e);
        setLoading(false);
      }
    };
    if (accessToken) {
      fetchData();
    }
  }, [accessToken, timeFrame]);

  return (
    <div style={{ padding: '20px' }}>
      <div id="title">
        <h1 style={{ color: "white" }}>Top Artists</h1>
        <select
          value={timeFrame}
          name="time"
          className="custom-select"
          onChange={(e) => setTimeFrame(e.target.value)}
        >
          <option value="short_term">Weekly</option>
          <option value="medium_term">Monthly</option>
          <option value="long_term">Yearly</option>
        </select>
      </div>
      {loading ? (
        <div className="loader" />
      ) : (
        <>
          <div id="top-artist-grid">
            {topArtists &&
              topArtists.map((artist) => {
                const artistImage =
                  artist.images && artist.images[0]
                    ? artist.images[0].url
                    : "../../public/spotify-default.jpg";
                return (
                  <div className="card-button-wrapper">
                    <a
                      key={artist.id}
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
              })}
          </div>
        </>
      )}
    </div>
  );
};

export default TopArtists;
