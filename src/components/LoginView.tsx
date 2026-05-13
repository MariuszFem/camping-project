import { useState } from 'react';

interface LoginViewProps {
  onLogin: (rola: string) => void;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [credentials, setCredentials] = useState({ login: '', haslo: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5050/api/Auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('rola', data.rola);
        localStorage.setItem('imie', data.imie);

        onLogin(data.rola);
      } else {
        setError(data.message || 'Błędny login lub hasło.');
      }
    } catch (err) {
      setError('Brak połączenia z serwerem. Sprawdź czy backend działa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card-left">
          <div className="login-brand-icon"></div>
          <h2 className="login-brand-title">CAMPING</h2>
          <p className="login-brand-sub">System zarządzania campingiem</p>
        </div>
        <div className="login-card-right">
          <h3 className="login-title">Zaloguj się</h3>
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <input
                type="text" 
                placeholder="Login" 
                required
                value={credentials.login}
                onChange={e => setCredentials({ ...credentials, login: e.target.value })}
              />
            </div>
            <div className="input-group">
              <input
                type="password" 
                placeholder="Hasło" 
                required
                value={credentials.haslo}
                onChange={e => setCredentials({ ...credentials, haslo: e.target.value })}
              />
            </div>
            {error && <div className="login-error" style={{ color: '#ff4d4d', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Łączenie...' : 'Zaloguj się →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}