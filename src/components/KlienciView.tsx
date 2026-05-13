import { useState } from 'react';
import { MOCK_KLIENCI } from '../data/mockData.ts';

/* prop searchTerm – tekst z wyszukiwarki w navbarze, nadpisuje lokalny search */
export function KlienciView({ searchTerm = '' }: { searchTerm?: string }) {
  const [klienci, setKlienci] = useState(MOCK_KLIENCI);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [newClient, setNewClient] = useState({ imie: '', nazwisko: '', email: '', telefon: '' });

  /* filtrowanie łączy globalną wyszukiwarkę z lokalną */
  const activeSearch = searchTerm || search;
  const filtered = klienci.filter(k =>
    `${k.imie} ${k.nazwisko} ${k.email}`.toLowerCase().includes(activeSearch.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const added = { ...newClient, id: klienci.length + 1, rezerwacje: 0 };
    setKlienci([...klienci, added]);
    setNewClient({ imie: '', nazwisko: '', email: '', telefon: '' });
    setShowForm(false);
  };

  const initials = (imie: string, nazwisko: string) => `${imie[0]}${nazwisko[0]}`.toUpperCase();
  const avatarColor = (id: number) => ['#16a34a', '#0891b2', '#7c3aed', '#db2777', '#d97706'][id % 5];

  return (
    <div>
      <div className="klienci-header">
        <h2 className="section-title"> Klienci</h2>
        <div className="klienci-actions">
          <div className="search-box">
            <input type="text" placeholder="Szukaj klienta..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="add-client-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Anuluj' : '+ Dodaj klienta'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="client-form-card">
          <form onSubmit={handleAdd} className="client-form-grid">
            <input placeholder="Imię" value={newClient.imie} onChange={e => setNewClient({ ...newClient, imie: e.target.value })} required />
            <input placeholder="Nazwisko" value={newClient.nazwisko} onChange={e => setNewClient({ ...newClient, nazwisko: e.target.value })} required />
            <button type="submit" className="add-btn form-submit-btn">Zapisz</button>
          </form>
        </div>
      )}

      <div className="klienci-grid">
        {filtered.map(k => (
          <div className="klient-card" key={k.id}>
            <div className="klient-avatar" style={{ background: avatarColor(k.id) }}>{initials(k.imie, k.nazwisko)}</div>
            <div className="klient-info">
              <div className="klient-name">{k.imie} {k.nazwisko}</div>
              <div className="klient-detail"> {k.email}</div>
            </div>
            <div className="klient-badge-col">
              <span className={`klient-rez-badge ${k.rezerwacje > 0 ? 'has-rez' : 'no-rez'}`}>
                {k.rezerwacje} rezerwacji
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}