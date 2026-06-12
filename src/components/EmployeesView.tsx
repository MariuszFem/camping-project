import { useState, useEffect } from 'react';
import {
  MdBadge, MdPersonAdd, MdClose, MdEdit, MdDelete,
  MdEmail, MdPhone, MdWork, MdKey, MdPeople,
  MdAdminPanelSettings, MdManageAccounts
} from 'react-icons/md';

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
      const bodyData = editID
        ? { ...form, pracownikID: editID, haslo: form.haslo || undefined }
        : form;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(bodyData)
      });
      if (res.ok) { setShowForm(false); setEditID(null); setForm(emptyForm); fetchPracownicy(); }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleEdit = (p: Pracownik) => {
    setForm({ imie: p.imie, nazwisko: p.nazwisko, stanowisko: p.stanowisko || '', telefon: p.telefon || '', email: p.email || '', login: p.login || '', haslo: '', rola: p.rola || 'Pracownik' });
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
    <div className="admin-page">

      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">
            <MdBadge size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Pracownicy
          </h2>
          <p className="admin-page-subtitle">{pracownicy.length} osób w systemie</p>
        </div>
        {isAdmin && (
          <button className="admin-add-btn" onClick={() => { setShowForm(!showForm); setEditID(null); setForm(emptyForm); }}>
            {showForm && !editID
              ? <><MdClose size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />Anuluj</>
              : <><MdPersonAdd size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />Dodaj pracownika</>
            }
          </button>
        )}
      </div>

      {/* Formularz */}
      {showForm && (
        <div className="admin-form-card">
          <h4 className="admin-form-title">
            {editID
              ? <><MdEdit size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Edytuj pracownika</>
              : <><MdPersonAdd size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Nowy pracownik</>
            }
          </h4>
          <form onSubmit={handleSave}>
            <div className="admin-form-grid">
              {[
                { key: 'imie',       label: 'Imię *',      required: true },
                { key: 'nazwisko',   label: 'Nazwisko *',  required: true },
                { key: 'stanowisko', label: 'Stanowisko' },
                { key: 'email',      label: 'Email',       type: 'email' },
                { key: 'telefon',    label: 'Telefon' },
                { key: 'login',      label: 'Login' },
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
                <label>Hasło {editID && <span style={{ fontWeight: 400, textTransform: 'none' }}>(zostaw puste aby nie zmieniać)</span>}</label>
                <input type="password" value={form.haslo} onChange={e => setForm({ ...form, haslo: e.target.value })} />
              </div>
              <div className="admin-form-field">
                <label>Rola</label>
                <select value={form.rola} onChange={e => setForm({ ...form, rola: e.target.value })}>
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
          <MdPeople size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Wszyscy: <b>{pracownicy.length}</b>
        </span>
        <span className="admin-chip admin-chip--blue">
          <MdAdminPanelSettings size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Adminów: <b>{pracownicy.filter(p => p.rola === 'Admin').length}</b>
        </span>
        <span className="admin-chip admin-chip--purple">
          <MdManageAccounts size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Pracownicy: <b>{pracownicy.filter(p => p.rola === 'Pracownik').length}</b>
        </span>
        {searchTerm && <span className="admin-chip">Wyniki: <b>{filtered.length}</b></span>}
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
                <span className="admin-name">{p.imie} {p.nazwisko}</span>
                <span className={`admin-role-badge ${p.rola === 'Admin' ? 'badge-admin' : 'badge-worker'}`}>
                  {p.rola === 'Admin'
                    ? <><MdAdminPanelSettings size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />Admin</>
                    : <><MdManageAccounts size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />Pracownik</>
                  }
                </span>
              </div>
              <div className="admin-meta">
                {p.stanowisko && <span><MdWork size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} />{p.stanowisko}</span>}
                {p.email     && <span><MdEmail size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} />{p.email}</span>}
                {p.telefon   && <span><MdPhone size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} />{p.telefon}</span>}
                {p.login     && <span><MdKey size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} />{p.login}</span>}
              </div>
            </div>

            {isAdmin && (
              <div className="admin-actions">
                <button className="admin-btn-edit" onClick={() => handleEdit(p)}>
                  <MdEdit size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />Edytuj
                </button>
                <button className="admin-btn-delete" onClick={() => handleDelete(p.pracownikID)}>
                  <MdDelete size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />Usuń
                </button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="admin-empty">Brak pracowników.</div>
        )}
      </div>
    </div>
  );
}
