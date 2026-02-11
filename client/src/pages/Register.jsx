import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { graphqlRequest } from '../graphql/client';

const CREATE_USER = `
  mutation CreateUser($username: String!, $email: String!, $password: String!, $displayName: String) {
    createUser(username: $username, email: $email, password: $password, displayName: $displayName) {
      id
      username
      email
      display_name
    }
  }
`;

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', displayName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await graphqlRequest(CREATE_USER, {
        username: form.username,
        email: form.email,
        password: form.password,
        displayName: form.displayName || undefined,
      });
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Register</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
            style={styles.input}
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={6}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Display name (optional)"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            style={styles.input}
          />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? '...' : 'Register'}
          </button>
        </form>
        <p style={styles.footer}>
          Have an account? <Link to="/login" style={styles.link}>Login</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0a0a0a',
    fontFamily: 'system-ui, sans-serif',
  },
  card: {
    background: '#141414',
    padding: '2rem',
    borderRadius: 8,
    width: '100%',
    maxWidth: 320,
  },
  title: {
    margin: '0 0 1.5rem',
    fontSize: '1.5rem',
    color: '#fff',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  input: {
    padding: '0.6rem 0.8rem',
    border: '1px solid #333',
    borderRadius: 6,
    background: '#1a1a1a',
    color: '#fff',
    fontSize: 14,
  },
  error: {
    margin: 0,
    color: '#e74c3c',
    fontSize: 13,
  },
  button: {
    padding: '0.7rem',
    background: '#fff',
    color: '#0a0a0a',
    border: 'none',
    borderRadius: 6,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  footer: {
    margin: '1rem 0 0',
    color: '#888',
    fontSize: 14,
  },
  link: {
    color: '#fff',
  },
};
