import { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosInstance';

interface Rezerwacja {
  rezerwacjaID: number;
  numerMiejsca: string;
  nazwaStrefy: string;
  dataPrzyjazdu: string;
  dataWyjazdu: string;
  liczbaOsob: number;
  status: string;
}

const statusColor: Record<string, string> = {
  'Nowa':       '#2563eb',
  'Potwierdzona': '#16a34a',
  'Anulowana':  '#dc2626',
  'Zakończona': '#64748b',
};

export function MojeRezerwacjeView() {
  const [rezerwacje, setRezerwacje] = useState<Rezerwacja[]>([]);
  const [loading, setLoading] = useState(true);
  const [anulowanieID, setAnulowanieID] = useState<number | null>(null);

  const klientID = localStorage.getItem('klientID');

  const fetchRezerwacje = useCallback(() => {
    if (!klientID) { setLoading(false); return; }
    api
      .get(`/Rezerwacje/moje/${klientID}`)
      .then(res => setRezerwacje(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [klientID]);

  useEffect(() => { fetchRezerwacje(); }, [fetchRezerwacje]);

  const handleAnuluj = async (id: number) => {
    setAnulowanieID(id);
    try {
      await api.put(`/Rezerwacje/anuluj/${id}`);
      fetchRezerwacje();
    } catch (err) {
      console.error(err);
    } finally {
      setAnulowanieID(null);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pl-PL');

  const liczbaDni = (od: string, do_: string) =>
    Math.ceil((new Date(do_).getTime() - new Date(od).getTime()) / (1000 * 60 * 60 * 24));

  if (loading) return <div className="loader">Pobieranie rezerwacji...</div>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h2 className="section-title">Moje rezerwacje</h2>

      {rezerwacje.length === 0 ? (
        <div style={{ background: '#1e293b', borderRadius: 12, padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}></div>
          <p style={{ fontSize: '1.1rem' }}>Nie masz jeszcze żadnych rezerwacji.</p>
          <p style={{ fontSize: '0.9rem' }}>Przejdź do zakładki Miejsca i zarezerwuj swoje miejsce.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {rezerwacje.map(r => {
            const dni = liczbaDni(r.dataPrzyjazdu, r.dataWyjazdu);
            return (
              <div key={r.rezerwacjaID} style={{
                background: '#1e293b',
                borderRadius: 12,
                padding: '1.5rem',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 20
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9' }}>
                    Miejsce {r.numerMiejsca}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{r.nazwaStrefy}</div>
                  <div style={{ fontSize: '0.88rem', color: '#cbd5e1', marginTop: 4 }}>
                    {formatDate(r.dataPrzyjazdu)} → {formatDate(r.dataWyjazdu)}
                    <span style={{ marginLeft: 8, color: '#64748b' }}>({dni} {dni === 1 ? 'noc' : 'nocy'})</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    Liczba osób: <b style={{ color: '#f1f5f9' }}>{r.liczbaOsob}</b>
                  </div>
                </div>

                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <span style={{
                    background: statusColor[r.status] || '#475569',
                    color: 'white',
                    padding: '6px 16px',
                    borderRadius: 20,
                    fontSize: '0.82rem',
                    fontWeight: 700
                  }}>
                    {r.status}
                  </span>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 6 }}>
                    #{r.rezerwacjaID}
                  </div>
                  {r.status === 'Nowa' && (
                    <button
                      onClick={() => handleAnuluj(r.rezerwacjaID)}
                      disabled={anulowanieID === r.rezerwacjaID}
                      style={{
                        marginTop: 10, display: 'block', width: '100%',
                        background: 'none', border: '1px solid #dc2626',
                        color: '#dc2626', borderRadius: 6, padding: '5px 10px',
                        fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600
                      }}
                    >
                      {anulowanieID === r.rezerwacjaID ? '...' : 'Anuluj'}
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
