import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { graphqlRequest } from '../graphql/client';

const GET_USER = `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      username
      display_name
    }
  }
`;

const GET_POSTS_BY_USER = `
  query GetPostsByUser($userId: ID!) {
    getPostsByUser(userId: $userId) {
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

export default function Profile() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      graphqlRequest(GET_USER, { id: userId }),
      graphqlRequest(GET_POSTS_BY_USER, { userId }),
    ])
      .then(([userRes, postsRes]) => {
        setUser(userRes.getUser);
        setPosts(postsRes.getPostsByUser || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div style={styles.page}>Loading...</div>;
  if (error) return <div style={styles.page}>Error: {error}</div>;
  if (!user) return <div style={styles.page}>User not found</div>;

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <span style={styles.brand}>Threads</span>
        <div>
          <Link to="/" style={styles.navLink}>
            Feed
          </Link>
          <Link to={`/profile/${userId}`} style={styles.navLink}>
            Profile
          </Link>
        </div>
      </nav>
      <main style={styles.main}>
        <div style={styles.profile}>
          <h1 style={styles.name}>{user.display_name || user.username}</h1>
          <p style={styles.handle}>@{user.username}</p>
        </div>
        <h2 style={styles.heading}>Posts</h2>
        {posts.length === 0 ? (
          <p style={styles.empty}>No posts yet.</p>
        ) : (
          <div style={styles.list}>
            {posts.map((post) => (
              <article key={post.id} style={styles.post}>
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
  main: {
    maxWidth: 600,
    margin: '0 auto',
    padding: '2rem',
  },
  profile: {
    marginBottom: '2rem',
  },
  name: {
    margin: '0 0 0.25rem',
    fontSize: '1.5rem',
  },
  handle: {
    margin: 0,
    color: '#888',
    fontSize: 14,
  },
  heading: {
    margin: '0 0 1rem',
    fontSize: '1rem',
    color: '#888',
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
  content: {
    margin: '0 0 0.5rem',
    lineHeight: 1.5,
  },
  time: {
    fontSize: 12,
    color: '#555',
  },
};
