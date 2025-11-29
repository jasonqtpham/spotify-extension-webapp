import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import mockphoto from '../images/mockprofilephoto.png';
import '../styles/Discover.css';
import axios from "axios";
const API = import.meta.env.VITE_API_URL || "http://localhost:5001";
export const Discover = () => {
  const [profiles, setProfiles] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  async function fetchPublicProfiles() {
    try {
      const res = await axios.get(`${API}/users/public`);
      setProfiles(res.data);
      setLoading(false); // Set loading to false after data is fetched
    } catch (error) {
      console.error("Error fetching profiles:", error);
      setLoading(false); // Set loading to false even if there is an error
    }
  }

  useEffect(() => {
    fetchPublicProfiles();
  }, []);

  const handleSearchButtonClick = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const filteredProfiles = profiles.filter(profile =>
    profile.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
    {/* HEADER SECTION WITH DISCOVER AND FOLLOWING TABS */}
    <header>
        <div className="header-content">
          <h1 className="header-title" style={{color: 'white'}}>Discover</h1>
          <div className="search-box">
            <button className="btn-search" onClick={handleSearchButtonClick}><i className="fas fa-search"></i></button>
            <input
              type="text"
              className="input-search"
              placeholder="Type to Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

    {loading ? (
      <div className="loader"/> // Show loading indicator
    ) : (
      <div className="Discography">
        {filteredProfiles.map((profile) => (
          <div key={profile.id} className="IndividualProfile">
            <a href={`/public-profile/${profile.id}`} className="profile-link">
              <img className="profile-image" src={profile.image || mockphoto} alt='Profile' />
              <p >{profile.username}</p>
            </a>
            <a href={`/draft/${profile.id}`} className="profile-chat-icon">
              <div className="chat-bubble"></div>
            </a>
          </div>
        ))}
      </div>
    )}
  </div>
);
};

export default Discover;
