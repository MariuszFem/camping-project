import { useState, useEffect } from 'react';

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

  useEffect(() => {
    fetchKlienci();
  }, []);

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
    <div className="klienci-page">

      <div className="klienci-header">
        <div>
          <h2 className="klienci-title"> Klienci</h2>
          <p className="klienci-subtitle">{klienci.length} zarejestrowanych klientów</p>
        </div>
        <div className="klienci-actions">
          <div className="klienci-search">
            <span className="klienci-search-icon"></span>
            <input
              type="text"
              placeholder="Szukaj po imieniu, nazwisku lub emailu..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="add-client-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Anuluj' : '+ Dodaj klienta'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="klienci-form-card">
          <h4>Nowy klient</h4>
          <form onSubmit={handleAdd} className="klienci-form-row">
            <input
              placeholder="Imię" required
              value={newClient.imie}
              onChange={e => setNewClient({ ...newClient, imie: e.target.value })}
            />
            <input
              placeholder="Nazwisko" required
              value={newClient.nazwisko}
              onChange={e => setNewClient({ ...newClient, nazwisko: e.target.value })}
            />
            <input
              placeholder="Email"
              value={newClient.email}
              onChange={e => setNewClient({ ...newClient, email: e.target.value })}
            />
            <input
              placeholder="Telefon"
              value={newClient.telefon}
              onChange={e => setNewClient({ ...newClient, telefon: e.target.value })}
            />
            <button type="submit" className="add-client-btn">Zapisz</button>
          </form>
        </div>
      )}

      <div className="klienci-chips">
        <span className="klienci-chip">Wszyscy: <b>{klienci.length}</b></span>
        <span className="klienci-chip">Aktywni: <b>{klienci.filter(k => k.rezerwacje > 0).length}</b></span>
        <span className="klienci-chip">Nowi: <b>{klienci.filter(k => k.rezerwacje === 0).length}</b></span>
        {activeSearch && <span className="klienci-chip">Wyniki: <b>{filtered.length}</b></span>}
      </div>

      <div className="klienci-list">
        {filtered.map(k => (
          <div className="klient-row" key={k.klientID}>
            <div className="klient-avatar" style={{ background: avatarColor(k.klientID) }}>
              {initials(k.imie, k.nazwisko)}
            </div>
            <div className="klient-info">
              <div className="klient-name">{k.imie} {k.nazwisko}</div>
              <div className="klient-meta">
                <span> {k.email}</span>
                {k.telefon && <span> {k.telefon}</span>}
              </div>
            </div>
            <span className={`klient-badge ${k.rezerwacje > 0 ? 'has-rez' : 'no-rez'}`}>
              {k.rezerwacje} {k.rezerwacje === 1 ? 'rezerwacja' : 'rezerwacji'}
            </span>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="klienci-empty">Brak wyników dla „{activeSearch}"</div>
        )}
      </div>

    </div>
  );
}
