import { useState, useEffect } from 'react';
import {
  MdSearch, MdPersonAdd, MdClose, MdPeople,
  MdEmail, MdPhone, MdCalendarMonth, MdBookmarks,
  MdPersonOff, MdVerifiedUser
} from 'react-icons/md';

interface Klient {
  klientID: number;
  imie: string;
  nazwisko: string;
  email: string;
  telefon: string;
  dataRejestracji: string;
  rezerwacje: number;
}

interface NewKlient {
  imie: string;
  nazwisko: string;
  email: string;
  telefon: string;
}

export function KlienciView({ searchTerm = '' }: { searchTerm?: string }) {
  const [klienci, setKlienci] = useState<Klient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [newClient, setNewClient] = useState<NewKlient>({ imie: '', nazwisko: '', email: '', telefon: '' });

  useEffect(() => { fetchKlienci(); }, []);

  const fetchKlienci = () => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:5050/api/Klienci/list', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then(data => setKlienci(Array.isArray(data) ? data : []))
      .catch(err => console.error('Błąd pobierania klientów:', err))
      .finally(() => setLoading(false));
  };

  const activeSearch = searchTerm || search;
  const filtered = klienci.filter(k =>
    `${k.imie} ${k.nazwisko} ${k.email}`.toLowerCase().includes(activeSearch.toLowerCase())
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5050/api/Klienci/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      });
      if (response.ok) {
        setNewClient({ imie: '', nazwisko: '', email: '', telefon: '' });
        setShowForm(false);
        fetchKlienci();
      }
    } catch (err) {
      console.error('Błąd dodawania klienta:', err);
    }
  };

  const initials = (imie: string, nazwisko: string) => `${imie[0]}${nazwisko[0]}`.toUpperCase();
  const avatarColor = (id: number) => ['#16a34a', '#0891b2', '#7c3aed', '#db2777', '#d97706'][id % 5];

  if (loading) return <div className="loader">Pobieranie klientów...</div>;

  return (
    <div className="admin-page">

      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">
            <MdPeople size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Klienci
          </h2>
          <p className="admin-page-subtitle">{klienci.length} zarejestrowanych klientów</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Wyszukiwarka */}
          <div className="klienci-search">
            <span className="klienci-search-icon"><MdSearch size={18} /></span>
            <input
              type="text"
              placeholder="Szukaj po imieniu, nazwisku lub emailu..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="admin-add-btn" onClick={() => setShowForm(!showForm)}>
            {showForm
              ? <><MdClose size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />Anuluj</>
              : <><MdPersonAdd size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />Dodaj klienta</>
            }
          </button>
        </div>
      </div>

      {/* Formularz */}
      {showForm && (
        <div className="admin-form-card">
          <h4 className="admin-form-title">
            <MdPersonAdd size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Nowy klient
          </h4>
          <form onSubmit={handleAdd}>
            <div className="admin-form-grid">
              <div className="admin-form-field">
                <label>Imię *</label>
                <input placeholder="Imię" required value={newClient.imie}
                  onChange={e => setNewClient({ ...newClient, imie: e.target.value })} />
              </div>
              <div className="admin-form-field">
                <label>Nazwisko *</label>
                <input placeholder="Nazwisko" required value={newClient.nazwisko}
                  onChange={e => setNewClient({ ...newClient, nazwisko: e.target.value })} />
              </div>
              <div className="admin-form-field">
                <label>Email</label>
                <input placeholder="Email" value={newClient.email}
                  onChange={e => setNewClient({ ...newClient, email: e.target.value })} />
              </div>
              <div className="admin-form-field">
                <label>Telefon</label>
                <input placeholder="Telefon" value={newClient.telefon}
                  onChange={e => setNewClient({ ...newClient, telefon: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="admin-save-btn">Zapisz</button>
          </form>
        </div>
      )}

      {/* Statystyki */}
      <div className="admin-chips">
        <span className="admin-chip">
          <MdPeople size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Wszyscy: <b>{klienci.length}</b>
        </span>
        <span className="admin-chip admin-chip--green">
          <MdVerifiedUser size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Aktywni: <b>{klienci.filter(k => k.rezerwacje > 0).length}</b>
        </span>
        <span className="admin-chip">
          <MdPersonOff size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Nowi: <b>{klienci.filter(k => k.rezerwacje === 0).length}</b>
        </span>
        {activeSearch && <span className="admin-chip">Wyniki: <b>{filtered.length}</b></span>}
      </div>

      {/* Lista */}
      <div className="admin-list">
        {filtered.map(k => (
          <div className="admin-row" key={k.klientID}>
            <div className="admin-avatar" style={{ background: avatarColor(k.klientID) }}>
              {initials(k.imie, k.nazwisko)}
            </div>
            <div className="admin-info">
              <div className="admin-name-row">
                <span className="admin-name">{k.imie} {k.nazwisko}</span>
                <span className={`admin-role-badge ${k.rezerwacje > 0 ? 'badge-admin' : 'badge-worker'}`}
                  style={k.rezerwacje > 0
                    ? { background: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' }
                    : { background: '#f8fafc', color: '#94a3b8', borderColor: '#e2e8f0' }
                  }>
                  <MdBookmarks size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                  {k.rezerwacje} {k.rezerwacje === 1 ? 'rezerwacja' : 'rezerwacji'}
                </span>
              </div>
              <div className="admin-meta">
                {k.email && (
                  <span><MdEmail size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} />{k.email}</span>
                )}
                {k.telefon && (
                  <span><MdPhone size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} />{k.telefon}</span>
                )}
                <span>
                  <MdCalendarMonth size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                  {new Date(k.dataRejestracji).toLocaleDateString('pl-PL')}
                </span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="admin-empty">Brak wyników dla „{activeSearch}"</div>
        )}
      </div>

    </div>
  );
}
