import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Inbox.css';
import PersonIcon from '@mui/icons-material/Person'; 
import DeleteIcon from '@mui/icons-material/Delete'; // Import the Delete icon
import TextField from "@mui/material/TextField";
import { Autocomplete } from "@mui/material";
const API = import.meta.env.VITE_API_URL || "http://localhost:5001";
export const Inbox = ({ toId = 'x' }) => {
  const [mode, setMode] = useState('yourPosts'); 
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messages, setMessages] = useState([]); 
  const [newMsg, setNewMsg] = useState({});
  const [users, setUsers] = useState([]);
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(true);

  const id = localStorage.getItem("id");

  async function fetchAllPosts() {
    setLoading(true); // Set loading to true before fetching
    const res = (await axios.get(`${API}/inbox/${id}`)).data;
    console.log(res);
    setMessages(res);
    if (res.length > 0) {
      setSelectedMessage(res[0]); 
    }
    setLoading(false); // Set loading to false after fetching
  }

  async function fetchAllUsers() {
    const res = (await axios.get(`${API}/inbox/draft/${toId}`)).data;
    console.log(res);
    setUsers(res["usernames"]);
    setTo(res["username"]);
    setNewMsg({ ...newMsg, "to": res["username"] });
  }

  useEffect(() => {
    fetchAllUsers();
    fetchAllPosts();
    if (toId !== 'x') {
      setMode("viewAll");
    }
  }, []);

  const handleToggle = (newMode) => {
    setMode(newMode);
    if (newMode === 'yourPosts' && messages.length > 0) {
      setTo('x');
      setSelectedMessage(messages[0]);
    } else {
      fetchAllUsers();
    }
  };

  const handleDelete = async () => {
    const msgId = selectedMessage["id"];
    const res = (await axios.delete(`${API}/inbox/${id}/${msgId}`)).data;
    console.log(res);
    fetchAllPosts();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await axios.post(`${API}/inbox/${id}`, newMsg);
    console.log(res);
    handleToggle("yourPosts");
    alert("Message Sent!");
    fetchAllPosts();
    // location.reload();
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white' }}>
        <h1>{mode === 'yourPosts' ? 'Inbox' : "Draft"}</h1>
        <div>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleToggle('yourPosts');
            }}
            className={`toggle-link ${mode === 'yourPosts' ? 'active' : ''}`}
          >
            <strong>Your Messages</strong>
          </a>
          <span className="separator">|</span>
          <a
            href="#"
            style={{ marginLeft: '.75vw' }}
            onClick={(e) => {
              e.preventDefault();
              handleToggle('viewAll');
            }}
            className={`toggle-link ${mode === 'viewAll' ? 'active' : ''}`}
          >
            <strong>Draft Message</strong>
          </a>
        </div>
      </div>
      <div>
        {mode === 'yourPosts' ? (
          <div className="messagesLayout">
            {loading ? (
              <div className="loadingscreen"></div>
            ) : (
              <>
                <div className="messageList">
                  {messages.map(msg => (
                    <div key={msg.id} onClick={() => setSelectedMessage(msg)} className="messagePreview">
                      <div className="iconAndText">
                        <PersonIcon className="personIcon"></PersonIcon>
                        <span>
                          <strong>{msg.From}</strong>: {msg.Title.length > 20 ? msg.Title.substring(0, 17) + '...' : msg.Title}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="messageSeparator"></div> 
                <div className="messageContent">
                  {selectedMessage ? (
                    <>
                      <div className="messageHeader">
                        <h3>Topic: {selectedMessage.Title}</h3>
                        <DeleteIcon className="deleteIcon" onClick={handleDelete} /> {/* Add the trash icon here */}
                      </div>
                      <hr className='forumPageHr'></hr>
                      <h5>From: {selectedMessage.From}</h5>
                      <br></br>
                      <h5>{selectedMessage.Content}</h5>
                    </>
                  ) : <p className="emptyInboxMessage">Your message inbox is empty!</p>}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="postsOutsideContainer">
            <h3>Draft Message</h3>
            <hr className="forumPageHr" />
            <form onSubmit={handleSubmit}>
              <Autocomplete
                disablePortal
                id="combo-box-demo"
                options={users}
                value={to}
                sx={{
                  "& .MuiInputBase-root": {
                    background: '#333',
                    borderRadius: 1,
                    padding: '10px',
                    marginBottom: '20px',
                    color: 'white',
                    "&::placeholder": {
                      color: 'rgba(255, 255, 255, 0.5)', 
                    },
                  },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: 'transparent',
                    },
                    "&:hover fieldset": {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      boxShadow: '0 0 0 3px rgba(138, 43, 226, 0.5), 0 0 0 4px #8A2BE2, 0 0 0 5px rgba(255, 0, 255, 0.5)',
                    },
                  },
                  "& .MuiAutocomplete-inputRoot": {
                    padding: 0, 
                  },
                  "& .MuiAutocomplete-endAdornment": {
                    color: 'white', 
                  },
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Username" 
                    InputProps={{
                      ...params.InputProps,
                      style: { padding: '10px' }, 
                    }}
                  />
                )}
                onChange={(e, value) => { 
                  setTo(value);
                  setNewMsg({ ...newMsg, "to": value })
                 }}
              />
              <input id="titleField" 
                type="text" 
                placeholder="Title" 
                className="inputField" 
                onChange={(e) => { setNewMsg({ ...newMsg, "title": e.target.value }) }}/>
              <textarea id="contentField" 
                placeholder="Content" 
                className="inputField"
                onChange={(e) => {
                  console.log(newMsg);
                  setNewMsg({ ...newMsg, "content": e.target.value })
                }}/>
              <button id="submitForum" type="submit" className="submitButton">Send Message</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
