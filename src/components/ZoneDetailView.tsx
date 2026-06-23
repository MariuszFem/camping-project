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
        <span key={i} style={{ color: i <= n ? '#f59e0b' : '#cbd5e1', fontSize: '1.1rem' }}>
          ★
        </span>
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
        if (found) setStrefa(found);
        else setError('Strefa o podanym ID nie istnieje.');
      })
      .catch(() => setError('Błąd pobierania danych strefy.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="zone-detail-loading">Ładowanie danych strefy...</div>;
  }

  if (error || !strefa) {
    return (
      <div className="zone-detail-error-wrap">
        <div className="zone-detail-error-icon"></div>
        <h2 className="zone-detail-error-title">Nie znaleziono strefy</h2>
        <p className="zone-detail-error-msg">{error}</p>
        <button className="zone-detail-error-btn" onClick={() => navigate('/strefy')}>
          ← Wróć do listy stref
        </button>
      </div>
    );
  }

  const cechy: string[] = (() => {
    try {
      return JSON.parse(strefa.cechy);
    } catch {
      return [];
    }
  })();

  const wolne = strefa.wolneMiejsca > 0;
  const dostepnosc = wolne ? `${strefa.wolneMiejsca} wolnych miejsc` : 'Brak wolnych miejsc';
  const scoreClass =
    strefa.ocena >= 9
      ? 'zone-detail-score--high'
      : strefa.ocena >= 8
        ? 'zone-detail-score--medium'
        : 'zone-detail-score--low';

  return (
    <div className="zone-detail-wrapper">
      <button className="zone-detail-back-btn" onClick={() => navigate('/strefy')}>
        ← Wróć do listy stref
      </button>

      <div className="zone-detail-hero">
        <img src={strefa.img} alt={strefa.nazwaStrefy} className="zone-detail-hero-img" />
        <div className="zone-detail-hero-overlay">
          {strefa.tag && <span className="zone-detail-tag">{strefa.tag}</span>}
          <h1 className="zone-detail-hero-title">{strefa.nazwaStrefy}</h1>
        </div>
      </div>

      <div className="zone-detail-grid">
        <div>
          <div className="zone-detail-meta-row">
            <Stars n={strefa.gwiazdki} />
            <span className="zone-detail-opinion-count">{strefa.liczbaOpinii} opinii</span>
            <span className={`zone-detail-score ${scoreClass}`}>{strefa.ocena.toFixed(1)}</span>
          </div>

          <section className="zone-detail-section">
            <h2 className="zone-detail-section-title">O strefie</h2>
            <p className="zone-detail-desc">{strefa.opis}</p>
          </section>

          <section className="zone-detail-section">
            <h2 className="zone-detail-section-title">Informacje</h2>
            <div className="zone-detail-stats-grid">
              {[
                { wartosc: `${strefa.miejscaLacznie}`, opis: 'Miejsc łącznie', kolor: '' },
                {
                  wartosc: dostepnosc,
                  opis: 'Dostępność',
                  kolor: wolne
                    ? 'zone-detail-stat-value--available'
                    : 'zone-detail-stat-value--full',
                },
                { wartosc: `${strefa.ocena.toFixed(1)} / 10`, opis: 'Średnia ocena', kolor: '' },
              ].map(item => (
                <div key={item.opis} className="zone-detail-stat-card">
                  <div className={`zone-detail-stat-value ${item.kolor}`}>{item.wartosc}</div>
                  <div className="zone-detail-stat-label">{item.opis}</div>
                </div>
              ))}
            </div>
          </section>

          {cechy.length > 0 && (
            <section className="zone-detail-section">
              <h2 className="zone-detail-section-title">Udogodnienia</h2>
              <ul className="zone-detail-amenities">
                {cechy.map((c, i) => (
                  <li key={i} className="zone-detail-amenity-item">
                    ✓ {c}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="zone-detail-sidebar">
          <div className="zone-detail-price-label">Cena od</div>
          <div className="zone-detail-price">
            {strefa.cenaOd} zł
            <span className="zone-detail-price-unit"> / noc</span>
          </div>

          <div
            className={`zone-detail-avail-badge ${wolne ? 'zone-detail-avail-badge--available' : 'zone-detail-avail-badge--full'}`}
          >
            {wolne ? `✓ ${strefa.wolneMiejsca} wolnych miejsc` : '✗ Brak wolnych miejsc'}
          </div>

          <div className="zone-detail-info-table">
            {[
              { label: 'Status', value: strefa.status },
              { label: 'Ocena', value: `${strefa.ocena.toFixed(1)} / 10` },
              { label: 'Opinie', value: `${strefa.liczbaOpinii}` },
            ].map(row => (
              <div key={row.label} className="zone-detail-info-row">
                <span>{row.label}</span>
                <span className="zone-detail-info-value">{row.value}</span>
              </div>
            ))}
          </div>

          <button
            className={`zone-detail-reserve-btn ${wolne ? 'zone-detail-reserve-btn--available' : 'zone-detail-reserve-btn--full'}`}
            disabled={!wolne}
            onClick={() => navigate('/strefy')}
          >
            {wolne ? 'Rezerwuj →' : 'Brak wolnych miejsc'}
          </button>

          <p className="zone-detail-reserve-note">Rezerwacja przez listę miejsc w strefie</p>
        </div>
      </div>
    </div>
  );
}
