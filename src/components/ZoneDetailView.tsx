import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';

interface Strefa {
  strefaID: number;
  nazwaStrefy: string;
  opis: string;
  udogodnienia: string;
  img: string;
  tag: string | null;
  ocena: number;
  liczbaOpinii: number;
  gwiazdki: number;
  cenaOd: number;
  cechy: string;
  miejscaLacznie: number;
  wolneMiejsca: number;
  status: string;
}

function Stars({ n }: { n: number }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= n ? '#f59e0b' : '#cbd5e1', fontSize: '1.1rem' }}>★</span>
      ))}
    </span>
  );
}

export function StrefaDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [strefa, setStrefa] = useState<Strefa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

  
    api
      .get<Strefa[]>('/Strefy/list')
      .then(res => {
        const found = res.data.find(s => s.strefaID === Number(id));
        if (found) {
          setStrefa(found);
        } else {
          setError('Strefa o podanym ID nie istnieje.');
        }
      })
      .catch(() => setError('Błąd pobierania danych strefy.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: '#94a3b8', fontSize: '1rem' }}>
       Ładowanie danych strefy...
      </div>
    );
  }

  if (error || !strefa) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: '#94a3b8' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}></div>
        <h2 style={{ color: '#f1f5f9', marginBottom: '0.5rem' }}>Nie znaleziono strefy</h2>
        <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>{error}</p>
        <button
          onClick={() => navigate('/strefy')}
          style={{
            padding: '10px 28px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '0.95rem',
            fontWeight: 600,
          }}
        >
          ← Wróć do listy stref
        </button>
      </div>
    );
  }

  const cechy: string[] = (() => {
    try { return JSON.parse(strefa.cechy); }
    catch { return []; }
  })();

  const dostepnosc = strefa.wolneMiejsca === 0 ? 'Brak wolnych miejsc' : `${strefa.wolneMiejsca} wolnych miejsc`;
  const dostepnoscKolor = strefa.wolneMiejsca === 0 ? '#ef4444' : '#22c55e';

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1.5rem' }}>

      <button
        onClick={() => navigate('/strefy')}
        style={{
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#94a3b8',
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: '0.88rem',
          marginBottom: '1.5rem',
          padding: '7px 16px',
          borderRadius: 8,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        ← Wróć do listy stref
      </button>

      <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', marginBottom: '1.8rem' }}>
        <img
          src={strefa.img}
          alt={strefa.nazwaStrefy}
          style={{ width: '100%', height: 340, objectFit: 'cover', display: 'block' }}
        />
        
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
          padding: '2rem 1.5rem 1.2rem',
        }}>
          {strefa.tag && (
            <span style={{
              background: '#f59e0b', color: 'white', padding: '3px 12px',
              borderRadius: 20, fontSize: '0.75rem', fontWeight: 700,
              marginBottom: 8, display: 'inline-block',
            }}>
              {strefa.tag}
            </span>
          )}
          <h1 style={{ margin: 0, color: 'white', fontSize: '1.9rem', fontWeight: 800, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            {strefa.nazwaStrefy}
          </h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem', alignItems: 'start' }}>

        <div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.2rem' }}>
            <Stars n={strefa.gwiazdki} />
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              {strefa.liczbaOpinii} opinii
            </span>
            <span style={{
              background: strefa.ocena >= 9 ? '#166534' : strefa.ocena >= 8 ? '#1e40af' : '#92400e',
              color: 'white', padding: '2px 10px', borderRadius: 6,
              fontSize: '0.82rem', fontWeight: 700,
            }}>
              {strefa.ocena.toFixed(1)}
            </span>
          </div>

          <section style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>
              O strefie
            </h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.75, fontSize: '0.92rem', margin: 0 }}>
              {strefa.opis}
            </p>
          </section>

          <section style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 10 }}>
              Informacje
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {[
                {  wartosc: `${strefa.miejscaLacznie}`, opis: 'Miejsc łącznie' },
                {  wartosc: dostepnosc, opis: 'Dostępność', kolor: dostepnoscKolor },
                {  wartosc: `${strefa.ocena.toFixed(1)} / 10`, opis: 'Średnia ocena' },
              ].map(item => (
                <div key={item.opis} style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  padding: '14px 12px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: item.kolor || '#f1f5f9' }}>
                    {item.wartosc}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>{item.opis}</div>
                </div>
              ))}
            </div>
          </section>

          
          {cechy.length > 0 && (
            <section>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 10 }}>
                Udogodnienia
              </h2>
              <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 8, listStyle: 'none', padding: 0, margin: 0 }}>
                {cechy.map((c, i) => (
                  <li key={i} style={{
                    background: 'rgba(37,99,235,0.12)',
                    border: '1px solid rgba(37,99,235,0.25)',
                    borderRadius: 20,
                    padding: '5px 14px',
                    fontSize: '0.82rem',
                    color: '#93c5fd',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}>
                    ✓ {c}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16,
          padding: '1.5rem',
          position: 'sticky',
          top: 20,
        }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
            Cena od
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#60a5fa', marginBottom: 4 }}>
            {strefa.cenaOd} zł
            <span style={{ fontSize: '0.95rem', fontWeight: 400, color: '#64748b' }}> / noc</span>
          </div>

          <div style={{
            background: strefa.wolneMiejsca === 0 ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
            border: `1px solid ${strefa.wolneMiejsca === 0 ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: dostepnoscKolor,
            textAlign: 'center',
            marginBottom: '1.2rem',
          }}>
            {strefa.wolneMiejsca === 0 ? '✗ Brak wolnych miejsc' : `✓ ${strefa.wolneMiejsca} wolnych miejsc`}
          </div>

          <div style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span>Status</span>
              <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{strefa.status}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span>Ocena</span>
              <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{strefa.ocena.toFixed(1)} / 10</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span>Opinie</span>
              <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{strefa.liczbaOpinii}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/strefy')}
            disabled={strefa.wolneMiejsca === 0}
            style={{
              marginTop: '1rem',
              width: '100%',
              padding: '12px',
              background: strefa.wolneMiejsca === 0 ? '#334155' : '#e67e00',
              color: strefa.wolneMiejsca === 0 ? '#64748b' : 'white',
              border: 'none',
              borderRadius: 10,
              cursor: strefa.wolneMiejsca === 0 ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.95rem',
              fontWeight: 700,
            }}
          >
            {strefa.wolneMiejsca === 0 ? 'Brak wolnych miejsc' : 'Rezerwuj →'}
          </button>

          <p style={{ fontSize: '0.75rem', color: '#475569', textAlign: 'center', marginTop: 8, marginBottom: 0 }}>
            Rezerwacja przez listę miejsc w strefie
          </p>
        </div>
      </div>
    </div>
  );
}
