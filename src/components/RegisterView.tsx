import { useState } from 'react';

interface Props {
  onSuccess: () => void;
  onLoginClick: () => void;
}

export function RejestracjaView({ onSuccess, onLoginClick }: Props) {
  const [form, setForm] = useState({ imie: '', nazwisko: '', email: '', telefon: '', login: '', haslo: '', haslo2: '' });
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
      if (response.ok) { setSuccess(true); setTimeout(() => onSuccess(), 2000); }
      else { setError(data.message || 'Błąd rejestracji.'); }
    } catch { setError('Brak połączenia z serwerem.'); }
    finally { setLoading(false); }
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 10,
    padding: '13px 16px',
    color: 'white',
    fontSize: '0.95rem',
    outline: 'none',
    fontFamily: 'inherit',
    width: '100%',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s'
  };

  return (
    <div className="login-page">
      <div style={{ display: 'flex', width: '100%', maxWidth: 900, background: 'rgba(255,255,255,0.04)', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>

        {/* Lewa strona */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '60px 40px', width: '38%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>⛺</div>
          <h2 style={{ fontFamily: 'Impact, sans-serif', fontSize: '1.8rem', letterSpacing: 3, margin: '0 0 8px' }}>CAMPING</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: 32 }}>Utwórz konto i zarezerwuj miejsce</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left', color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem' }}>
            <li>✓ Rezerwacja online 24/7</li>
            <li>✓ Podgląd swoich rezerwacji</li>
            <li>✓ Szybkie anulowanie</li>
            <li>✓ Bezpieczne konto</li>
          </ul>
        </div>

        {/* Prawa strona */}
        <div style={{ padding: '50px', flex: 1 }}>
          <h3 style={{ fontSize: '1.7rem', fontWeight: 700, margin: '0 0 4px' }}>Rejestracja</h3>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem', margin: '0 0 28px' }}>Wypełnij formularz żeby założyć konto</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <input style={inputStyle} placeholder="Imię *" required value={form.imie} onChange={e => setForm({ ...form, imie: e.target.value })} />
              <input style={inputStyle} placeholder="Nazwisko *" required value={form.nazwisko} onChange={e => setForm({ ...form, nazwisko: e.target.value })} />
              <input style={inputStyle} type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <input style={inputStyle} type="tel" placeholder="Telefon" value={form.telefon} onChange={e => setForm({ ...form, telefon: e.target.value })} />
            </div>

            <input style={inputStyle} placeholder="Login *" required value={form.login} onChange={e => setForm({ ...form, login: e.target.value })} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <input style={inputStyle} type="password" placeholder="Hasło *" required value={form.haslo} onChange={e => setForm({ ...form, haslo: e.target.value })} />
              <input style={inputStyle} type="password" placeholder="Powtórz hasło *" required value={form.haslo2} onChange={e => setForm({ ...form, haslo2: e.target.value })} />
            </div>

            {error && (
              <div style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid #dc2626', borderRadius: 8, padding: '10px 14px', color: '#fca5a5', fontSize: '0.88rem' }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{ background: 'rgba(22,163,74,0.15)', border: '1px solid #16a34a', borderRadius: 8, padding: '12px 14px', color: '#86efac', textAlign: 'center', fontWeight: 600 }}>
                ✓ Konto utworzone! Przekierowuję do logowania...
              </div>
            )}

            <button type="submit" disabled={loading || success}
              style={{ background: '#2563eb', color: 'white', padding: '14px', borderRadius: 10, border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '1rem', fontFamily: 'inherit', opacity: loading || success ? 0.7 : 1, transition: 'background 0.2s' }}>
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
