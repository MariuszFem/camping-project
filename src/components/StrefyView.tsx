import { useState, useEffect } from 'react';

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
  cechy: string; // JSON string
  miejscaLacznie: number;
  wolneMiejsca: number;
  status: string;
}

function Stars({ n }: { n: number }) {
  return (
    <span className="stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= n ? '#f59e0b' : '#ddd' }}>★</span>
      ))}
    </span>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 9 ? '#1a7f37' : score >= 8 ? '#2563eb' : '#d97706';
  return (
    <span className="score-badge" style={{ background: color }}>
      {score.toFixed(1)}
    </span>
  );
}

export function StrefyView({ searchTerm = '' }: { searchTerm?: string }) {
  const [strefy, setStrefy] = useState<Strefa[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Wszystkie');
  const [sortBy, setSortBy]             = useState('domyslnie');
  const [ulubione, setUlubione]         = useState<number[]>([]);

  useEffect(() => {
    fetch('http://localhost:5050/api/Strefy/list')
      .then(r => r.json())
      .then(data => setStrefy(data))
      .catch(err => console.error('Błąd pobierania stref:', err))
      .finally(() => setLoading(false));
  }, []);

  let filtered = strefy.filter(s =>
    `${s.nazwaStrefy} ${s.opis}`.toLowerCase().includes(searchTerm.toLowerCase())
  );
  if (statusFilter !== 'Wszystkie') filtered = filtered.filter(s => s.status === statusFilter);
  if (sortBy === 'cena-asc')   filtered = [...filtered].sort((a,b) => Number(a.cenaOd) - Number(b.cenaOd));
  if (sortBy === 'cena-desc')  filtered = [...filtered].sort((a,b) => Number(b.cenaOd) - Number(a.cenaOd));
  if (sortBy === 'ocena')      filtered = [...filtered].sort((a,b) => b.ocena - a.ocena);
  if (sortBy === 'miejsca')    filtered = [...filtered].sort((a,b) => b.wolneMiejsca - a.wolneMiejsca);

  const toggleUlubione = (id: number) =>
    setUlubione(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const parseCechy = (cechy: string): string[] => {
    try { return JSON.parse(cechy); } catch { return []; }
  };

  const minCena = filtered.length > 0 ? Math.min(...filtered.map(s => Number(s.cenaOd))) : 0;
  const dostepne = strefy.filter(s => s.status === 'Dostępna').length;
  const pelne    = strefy.filter(s => s.status === 'Pełna').length;

  if (loading) return <div className="loader">Pobieranie stref...</div>;

  return (
    <div className="view-layout">

      <aside className="filter-panel">
        <div className="filter-section">
          <div className="filter-title">Status</div>
          {[
            { label: 'Wszystkie', count: strefy.length },
            { label: 'Dostępna',  count: dostepne },
            { label: 'Pełna',     count: pelne },
          ].map(opt => (
            <label key={opt.label} className="filter-option">
              <input type="radio" name="status" checked={statusFilter === opt.label}
                onChange={() => setStatusFilter(opt.label)} />
              <span>{opt.label}</span>
              <span className="filter-count">{opt.count}</span>
            </label>
          ))}
        </div>

        <div className="filter-section">
          <div className="filter-title">Sortuj według</div>
          {[
            { val: 'domyslnie', label: 'Domyślnie' },
            { val: 'ocena',     label: 'Najwyżej oceniane' },
            { val: 'cena-asc',  label: 'Cena rosnąco' },
            { val: 'cena-desc', label: 'Cena malejąco' },
            { val: 'miejsca',   label: 'Najwięcej wolnych' },
          ].map(opt => (
            <label key={opt.val} className="filter-option">
              <input type="radio" name="sort" checked={sortBy === opt.val}
                onChange={() => setSortBy(opt.val)} />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>

        {(statusFilter !== 'Wszystkie' || sortBy !== 'domyslnie') && (
          <button className="filter-clear" onClick={() => { setStatusFilter('Wszystkie'); setSortBy('domyslnie'); }}>
            ✕ Wyczyść filtry
          </button>
        )}
      </aside>

      <div className="listing-main">
        <div className="summary-bar">
          <span>Znaleziono <b>{filtered.length}</b> {filtered.length === 1 ? 'strefę' : 'stref'}</span>
          {filtered.length > 0 && <span>Ceny od <b>{minCena} zł</b> / noc</span>}
        </div>

        <div className="listing-header">
          <h2 className="section-title" style={{ margin: 0 }}>Strefy campingowe</h2>
          <span className="listing-count">{filtered.length} wyników</span>
        </div>

        <div className="listing-grid">
          {filtered.map(s => (
            <div className="listing-card" key={s.strefaID}>

              <div className="listing-img-wrap">
                <img src={s.img} alt={s.nazwaStrefy} className="listing-img" />
                {s.tag && <span className="listing-tag">{s.tag}</span>}
                <button
                  className={`heart-btn ${ulubione.includes(s.strefaID) ? 'active' : ''}`}
                  onClick={() => toggleUlubione(s.strefaID)}
                  title="Dodaj do ulubionych"
                >
                  {ulubione.includes(s.strefaID) ? '♥' : '♡'}
                </button>
              </div>

              <div className="listing-body">
                <div className="listing-breadcrumb">Camping › Strefy › {s.nazwaStrefy.split('–')[0].trim()}</div>

                <div className="listing-top">
                  <div>
                    <h3 className="listing-title">{s.nazwaStrefy}</h3>
                    <Stars n={s.gwiazdki} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#888', fontSize: '0.78rem' }}>
                      Zobacz {s.liczbaOpinii} opinii
                    </span>
                    <ScoreBadge score={s.ocena} />
                  </div>
                </div>

                <p className="listing-desc">{s.opis}</p>
                <ul className="listing-features">
                  {parseCechy(s.cechy).map((c, i) => (
                    <li key={i}><span className="feat-dot">✓</span>{c}</li>
                  ))}
                </ul>
                <div className="listing-meta">
                  <span> {s.miejscaLacznie} miejsc łącznie</span>
                  <span style={{ color: s.wolneMiejsca === 0 ? '#e74c3c' : '#27ae60' }}>
                    ● {s.wolneMiejsca === 0 ? 'Brak wolnych' : `${s.wolneMiejsca} wolnych`}
                  </span>
                </div>
              </div>

              <div className="listing-price-box">
                <div className="listing-price-label">Od</div>
                <div className="listing-price">{s.cenaOd} zł<span>/noc</span></div>
                <button
                  className={`listing-btn ${s.status !== 'Dostępna' ? 'disabled' : ''}`}
                  disabled={s.status !== 'Dostępna'}
                >
                  {s.status === 'Dostępna' ? 'Rezerwuj' : 'Niedostępna'}
                </button>
                <div className="listing-avail">
                  {s.wolneMiejsca > 0 ? ` ${s.wolneMiejsca} dostępnych` : '✗ Brak miejsc'}
                </div>
              </div>

            </div>
          ))}
          {filtered.length === 0 && (
            <div className="empty-state" style={{ color: '#888' }}>Brak wyników dla podanych filtrów.</div>
          )}
        </div>
      </div>
    </div>
  );
}
