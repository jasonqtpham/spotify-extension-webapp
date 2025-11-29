import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import SearchIcon from '@rsuite/icons/Search';
import { AuthContext } from '../components/AuthContext';
import '../styles/TopSongs.css';
const API = import.meta.env.VITE_API_URL || "http://localhost:5001";
export const TopSongs = () => {
  const { userData } = useContext(AuthContext);
  const [topTracks, setTopTracks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState('medium_term'); // Default to monthly
  const [loading, setLoading] = useState(true); // Add loading state
  const searchInputRef = useRef(null); // Add ref for search input
  const accessToken = localStorage.getItem('access_token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API}/spotify/top-tracks`, {
          params: { access_token: accessToken, time_range: timeRange }
        });
        setTopTracks(response.data.items);
      } catch (e) {
        console.error('Error fetching top tracks', e);
      } finally {
        setLoading(false); // Set loading to false once data is fetched
      }
    };
    if (accessToken) {
      fetchData();
    }
  }, [accessToken, timeRange]);

  useEffect(() => {
    // Add class to body when component mounts
    document.body.classList.add('top-songs-body');
    // Remove class from body when component unmounts
    return () => {
      document.body.classList.remove('top-songs-body');
    };
  }, []);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  const handleSearchButtonClick = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const filteredTracks = topTracks?.filter(track =>
    track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.album.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artists.some(artist => artist.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleRowClick = (url) => {
    window.open(url, "_blank");
  };

  return (
    <div className="top-songs-container">
      <div className="banner">
        <div className="banner-content">
          <div className="banner-text">
            <h1>Top Songs</h1>
            <p>{filteredTracks.length} songs</p>
          </div>
        </div>
      </div>
      <div className="songs-list">
        <div className="header">
          <div className="search-box">
            <button className="btn-search" onClick={handleSearchButtonClick}><SearchIcon /></button>
            <input
              type="text"
              className="input-search"
              placeholder="Type to Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              ref={searchInputRef}
            />
          </div>
          <select
            value={timeRange}
            name="time"
            className="custom-select"
            onChange={handleTimeRangeChange}
          >
            <option value="short_term">Weekly</option>
            <option value="medium_term">Monthly</option>
            <option value="long_term">Yearly</option>
          </select>
        </div>
        {loading ? (
          <div className="loader"></div> 
        ) : (
          <>
            <div className="table-header">
              <div className="column-number">#</div>
              <div className="column-cover">Cover</div>
              <div className="column-title">Title</div>
              <div className="column-album">Album</div>
              <div className="column-artist">Artist</div>
            </div>
            {filteredTracks?.map((track, index) => (
              <div
                key={track.id}
                className="song-row"
                onClick={() => handleRowClick(track.external_urls.spotify)}
              >
                <div className="column-number">{index + 1}</div>
                <div className="column-cover">
                  <img
                    src={track.album.images[0].url}
                    alt={track.name}
                    className="song-cover"
                  />
                </div>
                <div className="column-title">{track.name}</div>
                <div className="column-album">{track.album.name}</div>
                <div className="column-artist">
                  {track.artists.map(artist => artist.name).join(', ')}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default TopSongs;
