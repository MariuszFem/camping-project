import { useState, useEffect, useCallback } from 'react';
import {
  MdSearch,
  MdPersonAdd,
  MdClose,
  MdPeople,
  MdEmail,
  MdPhone,
  MdCalendarMonth,
  MdBookmarks,
  MdPersonOff,
  MdVerifiedUser,
} from 'react-icons/md';
import api from '../api/axiosInstance';
import styles from '../styles/listing.module.css';

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
  const [newClient, setNewClient] = useState<NewKlient>({
    imie: '',
    nazwisko: '',
    email: '',
    telefon: '',
  });

  const fetchKlienci = useCallback(() => {
    api
      .get('/Klienci/list')
      .then(res => setKlienci(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error('Błąd pobierania klientów:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchKlienci();
  }, [fetchKlienci]);

  const activeSearch = searchTerm || search;
  const filtered = klienci.filter(k =>
    `${k.imie} ${k.nazwisko} ${k.email}`.toLowerCase().includes(activeSearch.toLowerCase())
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/Klienci/create', newClient);
      if (res.status < 300) {
        setNewClient({ imie: '', nazwisko: '', email: '', telefon: '' });
        setShowForm(false);
        fetchKlienci();
      }
    } catch (err) {
      console.error('Błąd dodawania klienta:', err);
    }
  };

  const initials = (imie: string, nazwisko: string) => `${imie[0]}${nazwisko[0]}`.toUpperCase();
  const avatarColor = (id: number) =>
    ['#16a34a', '#0891b2', '#7c3aed', '#db2777', '#d97706'][id % 5];

  if (loading) return <div className="loader">Pobieranie klientów...</div>;

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">
            <MdPeople size={24} className={styles.iconTitleLg} />
            Klienci
          </h2>
          <p className="admin-page-subtitle">{klienci.length} zarejestrowanych klientów</p>
        </div>
        <div className="admin-header-actions">
          {/* Wyszukiwarka */}
          <div className="klienci-search">
            <span className="klienci-search-icon">
              <MdSearch size={18} />
            </span>
            <input
              type="text"
              placeholder="Szukaj po imieniu, nazwisku lub emailu..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="admin-add-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? (
              <>
                <MdClose size={16} className={styles.iconBtnMd} />
                Anuluj
              </>
            ) : (
              <>
                <MdPersonAdd size={16} className={styles.iconBtnMd} />
                Dodaj klienta
              </>
            )}
          </button>
        </div>
      </div>

      {/* Formularz */}
      {showForm && (
        <div className="admin-form-card">
          <h4 className="admin-form-title">
            <MdPersonAdd size={16} className={styles.iconFormTitle} />
            Nowy klient
          </h4>
          <form onSubmit={handleAdd}>
            <div className="admin-form-grid">
              <div className="admin-form-field">
                <label>Imię *</label>
                <input
                  placeholder="Imię"
                  required
                  value={newClient.imie}
                  onChange={e => setNewClient({ ...newClient, imie: e.target.value })}
                />
              </div>
              <div className="admin-form-field">
                <label>Nazwisko *</label>
                <input
                  placeholder="Nazwisko"
                  required
                  value={newClient.nazwisko}
                  onChange={e => setNewClient({ ...newClient, nazwisko: e.target.value })}
                />
              </div>
              <div className="admin-form-field">
                <label>Email</label>
                <input
                  placeholder="Email"
                  value={newClient.email}
                  onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                />
              </div>
              <div className="admin-form-field">
                <label>Telefon</label>
                <input
                  placeholder="Telefon"
                  value={newClient.telefon}
                  onChange={e => setNewClient({ ...newClient, telefon: e.target.value })}
                />
              </div>
            </div>
            <button type="submit" className="admin-save-btn">
              Zapisz
            </button>
          </form>
        </div>
      )}

      {/* Statystyki */}
      <div className="admin-chips">
        <span className="admin-chip">
          <MdPeople size={13} className={styles.iconBtnMd} />
          Wszyscy: <b>{klienci.length}</b>
        </span>
        <span className="admin-chip admin-chip--green">
          <MdVerifiedUser size={13} className={styles.iconBtnMd} />
          Aktywni: <b>{klienci.filter(k => k.rezerwacje > 0).length}</b>
        </span>
        <span className="admin-chip">
          <MdPersonOff size={13} className={styles.iconBtnMd} />
          Nowi: <b>{klienci.filter(k => k.rezerwacje === 0).length}</b>
        </span>
        {activeSearch && (
          <span className="admin-chip">
            Wyniki: <b>{filtered.length}</b>
          </span>
        )}
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
                <span className="admin-name">
                  {k.imie} {k.nazwisko}
                </span>
                <span
                  className={`admin-role-badge ${k.rezerwacje > 0 ? 'badge-admin' : 'badge-worker'} ${k.rezerwacje > 0 ? styles.badgeActive : styles.badgeInactive}`}
                >
                  <MdBookmarks size={11} className={styles.iconInlineSm} />
                  {k.rezerwacje} {k.rezerwacje === 1 ? 'rezerwacja' : 'rezerwacji'}
                </span>
              </div>
              <div className="admin-meta">
                {k.email && (
                  <span>
                    <MdEmail size={12} className={styles.iconInlineSm} />
                    {k.email}
                  </span>
                )}
                {k.telefon && (
                  <span>
                    <MdPhone size={12} className={styles.iconInlineSm} />
                    {k.telefon}
                  </span>
                )}
                <span>
                  <MdCalendarMonth size={12} className={styles.iconInlineSm} />
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
