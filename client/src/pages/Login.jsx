import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { graphqlRequest } from '../graphql/client';

const LOGIN = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        username
        email
        display_name
      }
    }
  }
`;

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { login } = await graphqlRequest(LOGIN, {
        email: form.email,
        password: form.password,
      });
      localStorage.setItem('token', login.token);
      localStorage.setItem('user', JSON.stringify(login.user));
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Login</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
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
            style={styles.input}
          />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? '...' : 'Login'}
          </button>
        </form>
        <p style={styles.footer}>
          No account? <Link to="/register" style={styles.link}>Register</Link>
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
