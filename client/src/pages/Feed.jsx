import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { graphqlRequest } from '../graphql/client';

const GET_ALL_POSTS = `
  query GetAllPosts {
    getAllPosts {
      id
      content
      created_at
      author {
        id
        username
        display_name
      }
    }
  }
`;

const CREATE_POST = `
  mutation CreatePost($content: String!) {
    createPost(content: $content) {
      id
      content
      created_at
      author {
        id
        username
        display_name
      }
    }
  }
`;

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const fetchPosts = () => {
    graphqlRequest(GET_ALL_POSTS)
      .then(({ getAllPosts }) => setPosts(getAllPosts || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim() || !user) return;
    setPosting(true);
    try {
      await graphqlRequest(CREATE_POST, { content: newPost.trim() });
      setNewPost('');
      fetchPosts();
    } catch (err) {
      setError(err.message);
    } finally {
      setPosting(false);
    }
  };

  if (!token || !user) {
    return (
      <div style={styles.page}>
        <p style={styles.msg}>Please login to view the feed.</p>
        <div style={styles.authLinks}>
          <Link to="/login" style={styles.link}>Login</Link>
          <Link to="/register" style={styles.link}>Register</Link>
        </div>
      </div>
    );
  }

  if (loading) return <div style={styles.page}>Loading...</div>;
  if (error) return <div style={styles.page}>Error: {error}</div>;

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <span style={styles.brand}>Threads</span>
        <div>
          <Link to="/" style={styles.navLink}>Feed</Link>
          <Link to={`/profile/${user.id}`} style={styles.navLink}>Profile</Link>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
            style={styles.logoutBtn}
          >
            Logout
          </button>
        </div>
      </nav>
      <main style={styles.main}>
        <form onSubmit={handleCreatePost} style={styles.postForm}>
          <textarea
            placeholder="What's on your mind?"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            rows={2}
            style={styles.textarea}
          />
          <button type="submit" disabled={posting || !newPost.trim()} style={styles.postBtn}>
            Post
          </button>
        </form>
        <h2 style={styles.heading}>All Posts</h2>
        {posts.length === 0 ? (
          <p style={styles.empty}>No posts yet.</p>
        ) : (
          <div style={styles.list}>
            {posts.map((post) => (
              <article key={post.id} style={styles.post}>
                <Link to={`/profile/${post.author.id}`} style={styles.author}>
                  @{post.author.username}
                </Link>
                <p style={styles.content}>{post.content}</p>
                <time style={styles.time}>{new Date(post.created_at).toLocaleString()}</time>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0a0a0a',
    color: '#fff',
    fontFamily: 'system-ui, sans-serif',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    borderBottom: '1px solid #222',
  },
  brand: {
    fontWeight: 700,
    fontSize: '1.25rem',
  },
  navLink: {
    color: '#aaa',
    textDecoration: 'none',
    marginLeft: '1.5rem',
  },
  logoutBtn: {
    marginLeft: '1rem',
    padding: '0.25rem 0.5rem',
    background: 'transparent',
    color: '#888',
    border: '1px solid #444',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 13,
  },
  main: {
    maxWidth: 600,
    margin: '0 auto',
    padding: '2rem',
  },
  postForm: {
    marginBottom: '2rem',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #333',
    borderRadius: 6,
    background: '#141414',
    color: '#fff',
    fontSize: 14,
    resize: 'vertical',
    marginBottom: '0.5rem',
    boxSizing: 'border-box',
  },
  postBtn: {
    padding: '0.5rem 1rem',
    background: '#fff',
    color: '#0a0a0a',
    border: 'none',
    borderRadius: 6,
    fontWeight: 600,
    cursor: 'pointer',
  },
  heading: {
    margin: '0 0 1.5rem',
    fontSize: '1.25rem',
  },
  empty: {
    color: '#666',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  post: {
    padding: '1rem',
    background: '#141414',
    borderRadius: 8,
    border: '1px solid #222',
  },
  author: {
    color: '#888',
    textDecoration: 'none',
    fontSize: 14,
    display: 'block',
    marginBottom: '0.5rem',
  },
  content: {
    margin: '0 0 0.5rem',
    lineHeight: 1.5,
  },
  time: {
    fontSize: 12,
    color: '#555',
  },
  msg: {
    textAlign: 'center',
    padding: '4rem 2rem',
    color: '#888',
  },
  authLinks: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
  },
  link: {
    color: '#fff',
  },
};
