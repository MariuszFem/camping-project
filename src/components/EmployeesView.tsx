import { useState, useEffect, useCallback } from 'react';
import {
  MdBadge,
  MdPersonAdd,
  MdClose,
  MdEdit,
  MdDelete,
  MdEmail,
  MdPhone,
  MdWork,
  MdKey,
  MdPeople,
  MdAdminPanelSettings,
  MdManageAccounts,
} from 'react-icons/md';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/listing.module.css';

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

const emptyForm = {
  imie: '',
  nazwisko: '',
  stanowisko: '',
  telefon: '',
  email: '',
  login: '',
  haslo: '',
  rola: 'Pracownik',
};

const avatarColor = (id: number) => ['#2563eb', '#7c3aed', '#0891b2', '#db2777', '#d97706'][id % 5];
const initials = (imie: string, nazwisko: string) =>
  `${imie?.[0] || '?'}${nazwisko?.[0] || '?'}`.toUpperCase();

export function PracownicyView({ searchTerm = '' }: { searchTerm?: string }) {
  const [pracownicy, setPracownicy] = useState<Pracownik[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editID, setEditID] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const { isAdmin } = useAuth();

  const fetchPracownicy = useCallback(() => {
    api
      .get('/Pracownik/list')
      .then(res => setPracownicy(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchPracownicy();
  }, [fetchPracownicy]);

  const filtered = pracownicy.filter(p =>
    `${p.imie} ${p.nazwisko} ${p.stanowisko} ${p.email} ${p.rola}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editID) {
        await api.put(`/Pracownik/edit/${editID}`, {
          ...form,
          pracownikID: editID,
          haslo: form.haslo || undefined,
        });
      } else {
        await api.post('/Pracownik/add', form);
      }
      setShowForm(false);
      setEditID(null);
      setForm(emptyForm);
      fetchPracownicy();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (p: Pracownik) => {
    setForm({
      imie: p.imie,
      nazwisko: p.nazwisko,
      stanowisko: p.stanowisko || '',
      telefon: p.telefon || '',
      email: p.email || '',
      login: p.login || '',
      haslo: '',
      rola: p.rola || 'Pracownik',
    });
    setEditID(p.pracownikID);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Usunąć tego pracownika?')) return;
    await api.delete(`/Pracownik/delete/${id}`);
    fetchPracownicy();
  };

  if (loading) return <div className="loader">Pobieranie pracowników...</div>;

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">
            <MdBadge size={24} className={styles.iconTitleLg} />
            Pracownicy
          </h2>
          <p className="admin-page-subtitle">{pracownicy.length} osób w systemie</p>
        </div>
        {isAdmin && (
          <button
            className="admin-add-btn"
            onClick={() => {
              setShowForm(!showForm);
              setEditID(null);
              setForm(emptyForm);
            }}
          >
            {showForm && !editID ? (
              <>
                <MdClose size={16} className={styles.iconBtnMd} />
                Anuluj
              </>
            ) : (
              <>
                <MdPersonAdd size={16} className={styles.iconBtnMd} />
                Dodaj pracownika
              </>
            )}
          </button>
        )}
      </div>

      {/* Formularz */}
      {showForm && (
        <div className="admin-form-card">
          <h4 className="admin-form-title">
            {editID ? (
              <>
                <MdEdit size={16} className={styles.iconFormTitle} />
                Edytuj pracownika
              </>
            ) : (
              <>
                <MdPersonAdd size={16} className={styles.iconFormTitle} />
                Nowy pracownik
              </>
            )}
          </h4>
          <form onSubmit={handleSave}>
            <div className="admin-form-grid">
              {[
                { key: 'imie', label: 'Imię *', required: true },
                { key: 'nazwisko', label: 'Nazwisko *', required: true },
                { key: 'stanowisko', label: 'Stanowisko' },
                { key: 'email', label: 'Email', type: 'email' },
                { key: 'telefon', label: 'Telefon' },
                { key: 'login', label: 'Login' },
              ].map(({ key, label, required, type }) => (
                <div key={key} className="admin-form-field">
                  <label>{label}</label>
                  <input
                    type={type || 'text'}
                    required={required}
                    value={(form as Record<string, string>)[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                  />
                </div>
              ))}
              <div className="admin-form-field">
                <label>
                  Hasło{' '}
                  {editID && (
                    <span className={styles.hintLabel}>
                      (zostaw puste aby nie zmieniać)
                    </span>
                  )}
                </label>
                <input
                  type="password"
                  value={form.haslo}
                  onChange={e => setForm({ ...form, haslo: e.target.value })}
                />
              </div>
              <div className="admin-form-field">
                <label>Rola</label>
                <select
                  value={form.rola}
                  onChange={e => setForm({ ...form, rola: e.target.value })}
                >
                  <option value="Pracownik">Pracownik</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>
            <button type="submit" className="admin-save-btn" disabled={saving}>
              {saving ? 'Zapisywanie...' : editID ? 'Zapisz zmiany' : 'Dodaj pracownika'}
            </button>
          </form>
        </div>
      )}

      {/* Statystyki */}
      <div className="admin-chips">
        <span className="admin-chip">
          <MdPeople size={13} className={styles.iconBtnMd} />
          Wszyscy: <b>{pracownicy.length}</b>
        </span>
        <span className="admin-chip admin-chip--blue">
          <MdAdminPanelSettings size={13} className={styles.iconBtnMd} />
          Adminów: <b>{pracownicy.filter(p => p.rola === 'Admin').length}</b>
        </span>
        <span className="admin-chip admin-chip--purple">
          <MdManageAccounts size={13} className={styles.iconBtnMd} />
          Pracownicy: <b>{pracownicy.filter(p => p.rola === 'Pracownik').length}</b>
        </span>
        {searchTerm && (
          <span className="admin-chip">
            Wyniki: <b>{filtered.length}</b>
          </span>
        )}
      </div>

      {/* Lista */}
      <div className="admin-list">
        {filtered.map(p => (
          <div className="admin-row" key={p.pracownikID}>
            <div className="admin-avatar" style={{ background: avatarColor(p.pracownikID) }}>
              {initials(p.imie, p.nazwisko)}
            </div>

            <div className="admin-info">
              <div className="admin-name-row">
                <span className="admin-name">
                  {p.imie} {p.nazwisko}
                </span>
                <span
                  className={`admin-role-badge ${p.rola === 'Admin' ? 'badge-admin' : 'badge-worker'}`}
                >
                  {p.rola === 'Admin' ? (
                    <>
                      <MdAdminPanelSettings
                        size={11}
                        className={styles.iconInlineSm}
                      />
                      Admin
                    </>
                  ) : (
                    <>
                      <MdManageAccounts
                        size={11}
                        className={styles.iconInlineSm}
                      />
                      Pracownik
                    </>
                  )}
                </span>
              </div>
              <div className="admin-meta">
                {p.stanowisko && (
                  <span>
                    <MdWork size={12} className={styles.iconInlineSm} />
                    {p.stanowisko}
                  </span>
                )}
                {p.email && (
                  <span>
                    <MdEmail size={12} className={styles.iconInlineSm} />
                    {p.email}
                  </span>
                )}
                {p.telefon && (
                  <span>
                    <MdPhone size={12} className={styles.iconInlineSm} />
                    {p.telefon}
                  </span>
                )}
                {p.login && (
                  <span>
                    <MdKey size={12} className={styles.iconInlineSm} />
                    {p.login}
                  </span>
                )}
              </div>
            </div>

            {isAdmin && (
              <div className="admin-actions">
                <button className="admin-btn-edit" onClick={() => handleEdit(p)}>
                  <MdEdit size={14} className={styles.iconBtnMd} />
                  Edytuj
                </button>
                <button className="admin-btn-delete" onClick={() => handleDelete(p.pracownikID)}>
                  <MdDelete size={14} className={styles.iconBtnMd} />
                  Usuń
                </button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <div className="admin-empty">Brak pracowników.</div>}
      </div>
    </div>
  );
}
