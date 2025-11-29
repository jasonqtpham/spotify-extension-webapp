import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Auth = () => {
  return (
    <>

        <h1>Log in with Spotify</h1>
        <button style={{
            background: "linear-gradient(100deg, #8A2BE2, #FF00FF)", 
            color: "white", 
            width: "75%", 
            borderRadius: "4px",
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            textDecoration: "none",
            marginTop: "2em",
            border: '2px solid white',
        }}>
            <a href='http://127.0.0.1:5001/spotify/login' style={{color: "white", textDecoration: "none"}}><strong>Login</strong></a>
        </button>

    </>
  );
};


export default Auth;
