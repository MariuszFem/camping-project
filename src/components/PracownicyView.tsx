import { useState, useEffect } from 'react';

interface Pracownik {
  pracownikID: number;
  imie: string;
  nazwisko: string;
  stanowisko: string | null;
  telefon: string | null;
  email: string | null;
  login: string | null;
  haslo: string | null;
  rola: string | null;
}

const emptyForm = { imie: '', nazwisko: '', stanowisko: '', telefon: '', email: '', login: '', haslo: '', rola: 'Pracownik' };

const rolaBadge = (rola: string | null) => ({
  background: rola === 'Admin' ? '#2563eb' : rola === 'Pracownik' ? '#7c3aed' : '#475569',
  label: rola || 'Brak roli'
});

const avatarColor = (id: number) => ['#2563eb', '#7c3aed', '#0891b2', '#db2777', '#d97706'][id % 5];
const initials = (imie: string, nazwisko: string) => `${imie?.[0] || '?'}${nazwisko?.[0] || '?'}`.toUpperCase();

export function PracownicyView({ searchTerm = '' }: { searchTerm?: string }) {
  const [pracownicy, setPracownicy] = useState<Pracownik[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editID, setEditID] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem('token');
  const rola = localStorage.getItem('rola');
  const isAdmin = rola === 'Admin';

  const fetchPracownicy = () => {
    fetch('http://localhost:5050/api/Pracownik/list', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setPracownicy(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPracownicy(); }, []);

  const filtered = pracownicy.filter(p =>
    `${p.imie} ${p.nazwisko} ${p.stanowisko} ${p.email} ${p.rola}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editID ? `http://localhost:5050/api/Pracownik/edit/${editID}` : 'http://localhost:5050/api/Pracownik/add';
      const method = editID ? 'PUT' : 'POST';
      const body = editID ? { ...form, pracownikID: editID } : form;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      if (res.ok) { setShowForm(false); setEditID(null); setForm(emptyForm); fetchPracownicy(); }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleEdit = (p: Pracownik) => {
    setForm({ imie: p.imie, nazwisko: p.nazwisko, stanowisko: p.stanowisko || '', telefon: p.telefon || '', email: p.email || '', login: p.login || '', haslo: p.haslo || '', rola: p.rola || 'Pracownik' });
    setEditID(p.pracownikID);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Usunąć tego pracownika?')) return;
    await fetch(`http://localhost:5050/api/Pracownik/delete/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    fetchPracownicy();
  };

  if (loading) return <div className="loader">Pobieranie pracowników...</div>;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 className="section-title" style={{ margin: '0 0 4px' }}>Pracownicy</h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>{pracownicy.length} osób w systemie</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setShowForm(!showForm); setEditID(null); setForm(emptyForm); }}
            style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', fontFamily: 'inherit' }}>
            {showForm && !editID ? '✕ Anuluj' : '+ Dodaj pracownika'}
          </button>
        )}
      </div>

      {/* Formularz */}
      {showForm && (
        <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '1.5rem', marginBottom: 24 }}>
          <h4 style={{ margin: '0 0 1rem', color: '#f1f5f9' }}>{editID ? '✏️ Edytuj pracownika' : '➕ Nowy pracownik'}</h4>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              {[
                { key: 'imie', label: 'Imię *', required: true },
                { key: 'nazwisko', label: 'Nazwisko *', required: true },
                { key: 'stanowisko', label: 'Stanowisko' },
                { key: 'email', label: 'Email', type: 'email' },
                { key: 'telefon', label: 'Telefon' },
                { key: 'login', label: 'Login' },
              ].map(({ key, label, required, type }) => (
                <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
                  <input
                    type={type || 'text'}
                    required={required}
                    value={(form as Record<string, string>)[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '8px 12px', color: '#f1f5f9', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hasło</label>
                <input type="password" value={form.haslo} onChange={e => setForm({ ...form, haslo: e.target.value })}
                  style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '8px 12px', color: '#f1f5f9', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rola</label>
                <select value={form.rola} onChange={e => setForm({ ...form, rola: e.target.value })}
                  style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '8px 12px', color: '#f1f5f9', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }}>
                  <option value="Pracownik">Pracownik</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={saving}
              style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', fontFamily: 'inherit' }}>
              {saving ? 'Zapisywanie...' : editID ? 'Zapisz zmiany' : 'Dodaj pracownika'}
            </button>
          </form>
        </div>
      )}

      {/* Statystyki */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Wszyscy', count: pracownicy.length, color: '#475569' },
          { label: 'Adminów', count: pracownicy.filter(p => p.rola === 'Admin').length, color: '#2563eb' },
          { label: 'Pracownicy', count: pracownicy.filter(p => p.rola === 'Pracownik').length, color: '#7c3aed' },
        ].map(({ label, count, color }) => (
          <div key={label} style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 16px', display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }}></span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{label}:</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9' }}>{count}</span>
          </div>
        ))}
      </div>

      {/* Lista */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(p => {
          const badge = rolaBadge(p.rola);
          return (
            <div key={p.pracownikID} style={{
              background: '#1e293b', borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '1.2rem 1.5rem',
              display: 'flex', alignItems: 'center', gap: 16,
              transition: 'border-color 0.2s'
            }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: avatarColor(p.pracownikID), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                {initials(p.imie, p.nazwisko)}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>{p.imie} {p.nazwisko}</span>
                  <span style={{ background: badge.background, color: 'white', padding: '2px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700 }}>
                    {badge.label}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: '0.82rem', color: '#64748b', flexWrap: 'wrap' }}>
                  {p.stanowisko && <span>💼 {p.stanowisko}</span>}
                  {p.email && <span>✉️ {p.email}</span>}
                  {p.telefon && <span>📞 {p.telefon}</span>}
                  {p.login && <span>🔑 {p.login}</span>}
                </div>
              </div>

              {isAdmin && (
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => handleEdit(p)}
                    style={{ background: '#334155', color: '#94a3b8', border: 'none', padding: '7px 14px', borderRadius: 6, cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'inherit', fontWeight: 600 }}>
                    Edytuj
                  </button>
                  <button onClick={() => handleDelete(p.pracownikID)}
                    style={{ background: 'none', border: '1px solid #dc2626', color: '#dc2626', padding: '7px 14px', borderRadius: 6, cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'inherit', fontWeight: 600 }}>
                    Usuń
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ background: '#1e293b', borderRadius: 12, padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            Brak pracowników.
          </div>
        )}
      </div>
    </div>
  );
}
