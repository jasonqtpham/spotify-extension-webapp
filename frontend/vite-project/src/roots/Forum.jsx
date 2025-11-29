import { useState, useEffect } from 'react';
import axios from "axios";
import '../styles/Forum.css';
const API = import.meta.env.VITE_API_URL || "http://localhost:5001";
export const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [id, setId] = useState('');
  const [mode, setMode] = useState('viewAll');
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    setId(localStorage.getItem('id'));
    fetchData();
  }, [mode]);

  const fetchData = async () => {
    setLoading(true);
    await fetchAllPosts();
    await fetchMyPosts();
    setLoading(false);
  };
  async function fetchAllPosts() {
    const res = (await axios.get(`${API}/forum`)).data;
    console.log(res);
    setPosts(res);
  }

  async function fetchMyPosts() {
    const res = (await axios.get(`${API}/forum/${id}`)).data;
    for (const post of res) {
      }
    setMyPosts(res);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const body = {
      title,
      content,
      date: Date.now()
    };
    await axios.post(`${API}/forum/${id}`, body);
    location.reload();
  }

  const handleToggle = (newMode) => {
    setMode(newMode);
    console.log(`Selected mode: ${newMode}`);
  };

  const handleVote = async (post, voteType, userId) => {
    try {
        const response = await axios.post(`${API}/forum/vote/${id}`, {
            voteType,
            userId: userId,
            postId: post.id
        });

        if (response.status === 200) {
            fetchAllPosts();
            fetchMyPosts();
        }
    } catch (error) {
        console.error("Error voting on post:", error);
    }
};

  return (
    <div style={{ padding: '20px' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white' }}>
      <h1>Forum Page</h1>
      <div>
        <a href="#" onClick={(e) => { e.preventDefault(); handleToggle('yourPosts'); }} className={`toggle-link ${mode === 'yourPosts' ? 'active' : ''}`}>
          <strong>Your Posts</strong>
        </a>
        <span className="separator">|</span>
        <a href="#" style={{ marginLeft: '10px' }} onClick={(e) => { e.preventDefault(); handleToggle('viewAll'); }} className={`toggle-link ${mode === 'viewAll' ? 'active' : ''}`}>
          <strong>View All Posts</strong>
        </a>
        <span className="separator">|</span>
        <a href="#" style={{ marginLeft: '10px' }} onClick={(e) => { e.preventDefault(); handleToggle('draftNew'); }} className={`toggle-link ${mode === 'draftNew' ? 'active' : ''}`}>
          <strong>Draft New Post</strong>
        </a>
      </div>
    </div>
    <div>
      {loading ? (
        <div className="loader"></div>
      ) : (
        <>
          {mode === 'yourPosts' ? (
            <div className="postsOutsideContainer">
              <h3>Your Posts</h3>
              <hr className="forumPageHr" />
              {myPosts.map(post => (
                <div key={post.id} className="postWrapper">
                  <div className="postBar"></div>
                  <div className="postContainer">
                    <div className="postHeader">
                      <span className="postTitle">{post.Title}</span>
                      <span className="postAuthor">{post.Author}</span>
                    </div>
                    <div className="postBody">{post.Content}</div>
                    <div className="postDate">Posted on {post.Date}</div>
                    <div className="postUpvotes">Upvotes: {post["upVoteUsers"].length - post["downVoteUsers"].length}</div>
                  </div>
                  {id && (
                    <div className="voteButtons">
                      <button id={post["upVoteUsers"].includes(id) ? "voted1" : "vote1"} className="voteButton" onClick={() => handleVote(post, 'upvote', id)}>⬆</button>
                      <button id={post["downVoteUsers"].includes(id) ? "voted2" : "vote2"} className="voteButton" onClick={() => handleVote(post, 'downvote', id)}>⬇</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : mode === 'viewAll' ? (
            <div className="postsOutsideContainer">
              <h3>All Posts</h3>
              <hr className="forumPageHr" />
              {posts.map(post => (
                <div key={post.id} className="postWrapper">
                  <div className="postBar"></div>
                  <div className="postContainer">
                    <div className="postHeader">
                      <span className="postTitle">{post.Title}</span>
                      <span className="postAuthor">{post.Author}</span>
                    </div>
                    <div className="postBody">{post.Content}</div>
                    <div className="postDate">Posted on {post.Date}</div>
                    <div className="postUpvotes">Upvotes: {post["upVoteUsers"].length - post["downVoteUsers"].length}</div>
                  </div>
                  {id && (
                    <div className="voteButtons">
                      <button id={post["upVoteUsers"].includes(id) ? "voted1" : "vote1"} className="voteButton" onClick={() => handleVote(post, 'upvote', post["userId"])}>⬆</button>
                      <button id={post["downVoteUsers"].includes(id) ? "voted2" : "vote2"} className="voteButton" onClick={() => handleVote(post, 'downvote', post["userId"])}>⬇</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="postsOutsideContainer">
              <h3>Draft New Post</h3>
              <hr className="forumPageHr" />
              <form onSubmit={handleSubmit}>
                <input id="titleField" type="text" placeholder="Title" className="inputField" onChange={(e) => setTitle(e.target.value)} />
                <textarea id="contentField" placeholder="Content" className="inputField" onChange={(e) => setContent(e.target.value)} />
                <button id="submitForum" type="submit" className="submitButton">Submit Post</button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  </div>
);
};

export default Forum;
