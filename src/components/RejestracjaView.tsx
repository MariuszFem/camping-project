import { useState } from 'react';

interface Props {
  onSuccess: () => void;
  onLoginClick: () => void;
}

export function RejestracjaView({ onSuccess, onLoginClick }: Props) {
  const [form, setForm] = useState({
    imie: '', nazwisko: '', email: '', telefon: '', login: '', haslo: '', haslo2: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.haslo !== form.haslo2) { setError('Hasła nie są zgodne.'); return; }
    if (form.haslo.length < 4) { setError('Hasło musi mieć co najmniej 4 znaki.'); return; }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5050/api/Klienci/rejestracja', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imie: form.imie, nazwisko: form.nazwisko, email: form.email, telefon: form.telefon, login: form.login, haslo: form.haslo })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => onSuccess(), 2000);
      }
      else { setError(data.message || 'Błąd rejestracji.'); }    } catch { setError('Brak połączenia z serwerem.'); }
    finally { setLoading(false); }
  };

  const field = (key: keyof typeof form, placeholder: string, type = 'text') => (
    <div className="input-group">
      <input
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        required={['imie','nazwisko','login','haslo','haslo2'].includes(key)}
      />
    </div>
  );

  return (
    <div className="login-page">
      <div className="login-card" style={{ width: 860 }}>

        <div className="login-card-left">
          <div style={{ fontSize: '3.5rem', marginBottom: 16 }}></div>
          <h2 className="login-brand-title">CAMPING</h2>
          <p className="login-brand-sub">Utwórz konto i zarezerwuj swoje miejsce</p>
          <ul className="login-features" style={{ marginTop: 24 }}>
            <li>✓ Rezerwacja online 24/7</li>
            <li>✓ Podgląd swoich rezerwacji</li>
            <li>✓ Szybkie anulowanie</li>
            <li>✓ Bezpieczne konto</li>
          </ul>
        </div>

        <div className="login-card-right">
          <h3 className="login-title">Rejestracja</h3>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem', marginBottom: 8, marginTop: -8 }}>
            Wypełnij formularz żeby założyć konto
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {field('imie', 'Imię *')}
              {field('nazwisko', 'Nazwisko *')}
              {field('email', 'Email', 'email')}
              {field('telefon', 'Telefon', 'tel')}
            </div>

            {field('login', 'Login *')}
            {field('haslo', 'Hasło *', 'password')}
            {field('haslo2', 'Powtórz hasło *', 'password')}

            {error && (
              <div className="login-error">{error}</div>
            )}

            {success && (
              <div style={{ background: 'rgba(22,163,74,0.2)', border: '1px solid #16a34a', borderRadius: 8, padding: '12px', color: '#86efac', textAlign: 'center', fontWeight: 600 }}>
                ✓ Konto zostało utworzone! Przekierowuję do logowania...
              </div>
            )}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Rejestrowanie...' : 'Zarejestruj się →'}
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
              Masz już konto?{' '}
              <button type="button" onClick={onLoginClick}
                style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', fontSize: 'inherit' }}>
                Zaloguj się
              </button>
            </p>
          </form>
        </div>

      </div>
    </div>
  );
}
