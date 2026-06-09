import { useState, useEffect } from 'react';

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

const statusColor: Record<string, string> = {
  'Nowa': '#2563eb',
  'Potwierdzona': '#16a34a',
  'Anulowana': '#dc2626',
  'Zakończona': '#475569',
};

const statusBg: Record<string, string> = {
  'Nowa': 'rgba(37,99,235,0.1)',
  'Potwierdzona': 'rgba(22,163,74,0.1)',
  'Anulowana': 'rgba(220,38,38,0.1)',
  'Zakończona': 'rgba(71,85,105,0.1)',
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
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 className="section-title" style={{ margin: '0 0 16px' }}>Zarządzanie rezerwacjami</h2>

        {/* Filtry statusów */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['Wszystkie', 'Nowa', 'Potwierdzona', 'Anulowana', 'Zakończona'].map(s => {
            const count = s === 'Wszystkie' ? rezerwacje.length : rezerwacje.filter(r => r.status === s).length;
            const isActive = filterStatus === s;
            return (
              <button key={s} onClick={() => setFilterStatus(s)} style={{
                background: isActive ? (s === 'Wszystkie' ? '#2563eb' : statusColor[s]) : '#1e293b',
                color: isActive ? 'white' : '#94a3b8',
                border: `1px solid ${isActive ? 'transparent' : 'rgba(255,255,255,0.08)'}`,
                padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
                fontSize: '0.82rem', fontWeight: 600, fontFamily: 'inherit',
                transition: 'all 0.15s'
              }}>
                {s} <span style={{ opacity: 0.7 }}>({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: '#1e293b', borderRadius: 12, padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📋</div>
          <p>Brak rezerwacji dla wybranego filtra.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(r => {
            const dni = liczbaDni(r.dataPrzyjazdu, r.dataWyjazdu);
            return (
              <div key={r.rezerwacjaID} style={{
                background: '#1e293b',
                borderRadius: 12,
                padding: '1.2rem 1.5rem',
                border: `1px solid ${statusBg[r.status] || 'rgba(255,255,255,0.08)'}`,
                borderLeft: `4px solid ${statusColor[r.status] || '#475569'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 16
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>#{r.rezerwacjaID}</span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>{r.klientImie}</span>
                    <span style={{ background: '#0f172a', color: '#94a3b8', padding: '2px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>
                      Miejsce {r.numerMiejsca}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    📅 {formatDate(r.dataPrzyjazdu)} → {formatDate(r.dataWyjazdu)}
                    <span style={{ marginLeft: 8, color: '#64748b' }}>({dni} {dni === 1 ? 'noc' : 'nocy'})</span>
                    <span style={{ marginLeft: 12 }}>👥 {r.liczbaOsob} {r.liczbaOsob === 1 ? 'osoba' : 'osoby'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{
                    background: statusColor[r.status] || '#475569',
                    color: 'white', padding: '5px 14px',
                    borderRadius: 20, fontSize: '0.8rem', fontWeight: 700
                  }}>
                    {r.status}
                  </span>

                  {r.status === 'Nowa' && (
                    <>
                      <button onClick={() => changeStatus(r.rezerwacjaID, 'Potwierdzona')}
                        disabled={processingID === r.rezerwacjaID}
                        style={{ background: '#16a34a', color: 'white', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', fontFamily: 'inherit' }}>
                        ✓ Potwierdź
                      </button>
                      <button onClick={() => changeStatus(r.rezerwacjaID, 'Anulowana')}
                        disabled={processingID === r.rezerwacjaID}
                        style={{ background: 'none', border: '1px solid #dc2626', color: '#dc2626', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', fontFamily: 'inherit' }}>
                        ✗ Anuluj
                      </button>
                    </>
                  )}

                  {r.status === 'Potwierdzona' && (
                    <button onClick={() => changeStatus(r.rezerwacjaID, 'Zakończona')}
                      disabled={processingID === r.rezerwacjaID}
                      style={{ background: '#475569', color: 'white', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', fontFamily: 'inherit' }}>
                      Zakończ
                    </button>
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
