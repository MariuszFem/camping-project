import { useState, useEffect } from 'react';
import {
  MdEventNote, MdCalendarMonth, MdPeople, MdLocationOn,
  MdCheckCircle, MdCancel, MdDoneAll, MdHourglassEmpty,
  MdFilterList
} from 'react-icons/md';

interface Rezerwacja {
  rezerwacjaID: number;
  klientImie: string;
  numerMiejsca: string;
  dataRezerwacji: string;
  dataPrzyjazdu: string;
  dataWyjazdu: string;
  liczbaOsob: number;
  status: string;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  'Nowa':        { color: '#2563eb', bg: 'rgba(37,99,235,0.08)',  icon: <MdHourglassEmpty size={13} /> },
  'Potwierdzona':{ color: '#16a34a', bg: 'rgba(22,163,74,0.08)',  icon: <MdCheckCircle size={13} /> },
  'Anulowana':   { color: '#dc2626', bg: 'rgba(220,38,38,0.08)',  icon: <MdCancel size={13} /> },
  'Zakończona':  { color: '#475569', bg: 'rgba(71,85,105,0.08)',  icon: <MdDoneAll size={13} /> },
};

export function RezerwacjeAdminView({ searchTerm = '' }: { searchTerm?: string }) {
  const [rezerwacje, setRezerwacje] = useState<Rezerwacja[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingID, setProcessingID] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState('Wszystkie');

  const token = localStorage.getItem('token');

  const fetchRezerwacje = () => {
    fetch('http://localhost:5050/api/Rezerwacje/list', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setRezerwacje(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRezerwacje(); }, []);

  const changeStatus = async (id: number, nowyStatus: string) => {
    setProcessingID(id);
    try {
      const res = await fetch(`http://localhost:5050/api/Rezerwacje/zmien-status/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: nowyStatus })
      });
      if (res.ok) fetchRezerwacje();
    } catch (err) { console.error(err); }
    finally { setProcessingID(null); }
  };

  let filtered = rezerwacje.filter(r =>
    `${r.klientImie} ${r.numerMiejsca} ${r.status}`.toLowerCase().includes(searchTerm.toLowerCase())
  );
  if (filterStatus !== 'Wszystkie') filtered = filtered.filter(r => r.status === filterStatus);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pl-PL');
  const liczbaDni = (od: string, do_: string) =>
    Math.ceil((new Date(do_).getTime() - new Date(od).getTime()) / (1000 * 60 * 60 * 24));

  if (loading) return <div className="loader">Pobieranie rezerwacji...</div>;

  return (
    <div className="admin-page">

      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">
            <MdEventNote size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Zarządzanie rezerwacjami
          </h2>
          <p className="admin-page-subtitle">{rezerwacje.length} rezerwacji łącznie</p>
        </div>
      </div>

      {/* Filtry statusów */}
      <div className="admin-chips" style={{ marginBottom: 20 }}>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 4 }}>
          <MdFilterList size={15} />Filtruj:
        </span>
        {['Wszystkie', 'Nowa', 'Potwierdzona', 'Anulowana', 'Zakończona'].map(s => {
          const count = s === 'Wszystkie' ? rezerwacje.length : rezerwacje.filter(r => r.status === s).length;
          const cfg = STATUS_CONFIG[s];
          const isActive = filterStatus === s;
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`rez-filter-btn ${isActive ? 'active' : ''}`}
              style={isActive ? { background: cfg?.color || '#2563eb', borderColor: cfg?.color || '#2563eb', color: 'white' } : {}}
            >
              {cfg?.icon && <span style={{ display: 'flex', alignItems: 'center' }}>{cfg.icon}</span>}
              {s} <span className="rez-filter-count">({count})</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="admin-empty" style={{ padding: '3rem' }}>
          <MdEventNote size={40} style={{ opacity: 0.3, display: 'block', margin: '0 auto 12px' }} />
          Brak rezerwacji dla wybranego filtra.
        </div>
      ) : (
        <div className="admin-list">
          {filtered.map(r => {
            const dni = liczbaDni(r.dataPrzyjazdu, r.dataWyjazdu);
            const cfg = STATUS_CONFIG[r.status] || { color: '#475569', bg: 'rgba(71,85,105,0.08)', icon: null };
            return (
              <div
                key={r.rezerwacjaID}
                className="admin-row rez-row"
                style={{ borderLeft: `4px solid ${cfg.color}` }}
              >
                {/* Lewa część – info */}
                <div className="rez-info">
                  <div className="rez-top">
                    <span className="rez-id">#{r.rezerwacjaID}</span>
                    <span className="rez-client">{r.klientImie}</span>
                    <span className="rez-place">
                      <MdLocationOn size={13} style={{ verticalAlign: 'middle', marginRight: 2 }} />
                      Miejsce {r.numerMiejsca}
                    </span>
                  </div>
                  <div className="rez-meta">
                    <span>
                      <MdCalendarMonth size={13} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                      {formatDate(r.dataPrzyjazdu)} → {formatDate(r.dataWyjazdu)}
                      <span className="rez-nights">({dni} {dni === 1 ? 'noc' : 'nocy'})</span>
                    </span>
                    <span>
                      <MdPeople size={13} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                      {r.liczbaOsob} {r.liczbaOsob === 1 ? 'osoba' : 'osoby'}
                    </span>
                  </div>
                </div>

                {/* Prawa część – status + akcje */}
                <div className="rez-right">
                  <span className="rez-status-badge" style={{ background: cfg.color }}>
                    {cfg.icon}
                    {r.status}
                  </span>

                  {r.status === 'Nowa' && (
                    <div className="rez-btns">
                      <button
                        className="rez-btn rez-btn--confirm"
                        disabled={processingID === r.rezerwacjaID}
                        onClick={() => changeStatus(r.rezerwacjaID, 'Potwierdzona')}
                      >
                        <MdCheckCircle size={14} style={{ verticalAlign: 'middle', marginRight: 3 }} />Potwierdź
                      </button>
                      <button
                        className="rez-btn rez-btn--cancel"
                        disabled={processingID === r.rezerwacjaID}
                        onClick={() => changeStatus(r.rezerwacjaID, 'Anulowana')}
                      >
                        <MdCancel size={14} style={{ verticalAlign: 'middle', marginRight: 3 }} />Anuluj
                      </button>
                    </div>
                  )}

                  {r.status === 'Potwierdzona' && (
                    <div className="rez-btns">
                      <button
                        className="rez-btn rez-btn--finish"
                        disabled={processingID === r.rezerwacjaID}
                        onClick={() => changeStatus(r.rezerwacjaID, 'Zakończona')}
                      >
                        <MdDoneAll size={14} style={{ verticalAlign: 'middle', marginRight: 3 }} />Zakończ
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
