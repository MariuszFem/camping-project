import { useState } from 'react';
import { MOCK_STREFY } from '../data/mockData.ts';

/* gwiazdki na podstawie liczby 1-5 */
function Stars({ n }: { n: number }) {
  return (
    <span className="stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= n ? '#f59e0b' : '#ddd' }}>★</span>
      ))}
    </span>
  );
}

/* kółko z oceną – kolor zależy od wartości */
function ScoreBadge({ score }: { score: number }) {
  const color = score >= 9 ? '#1a7f37' : score >= 8 ? '#2563eb' : '#d97706';
  return (
    <span className="score-badge" style={{ background: color }}>
      {score.toFixed(1)}
    </span>
  );
}

export function StrefyView({ searchTerm = '' }: { searchTerm?: string }) {
  const [statusFilter, setStatusFilter] = useState('Wszystkie');
  const [sortBy, setSortBy]             = useState('domyslnie');
  const [ulubione, setUlubione]         = useState<number[]>([]);

  let filtered = MOCK_STREFY.filter(s =>
    `${s.nazwa} ${s.opis}`.toLowerCase().includes(searchTerm.toLowerCase())
  );
  if (statusFilter !== 'Wszystkie') filtered = filtered.filter(s => s.status === statusFilter);
  if (sortBy === 'cena-asc')   filtered = [...filtered].sort((a,b) => a.cenaOd - b.cenaOd);
  if (sortBy === 'cena-desc')  filtered = [...filtered].sort((a,b) => b.cenaOd - a.cenaOd);
  if (sortBy === 'ocena')      filtered = [...filtered].sort((a,b) => b.ocena - a.ocena);
  if (sortBy === 'miejsca')    filtered = [...filtered].sort((a,b) => b.wolne - a.wolne);

  const toggleUlubione = (id: number) =>
    setUlubione(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const minCena = Math.min(...filtered.map(s => s.cenaOd));
  const dostepne = MOCK_STREFY.filter(s => s.status === 'Dostępna').length;
  const pelne    = MOCK_STREFY.filter(s => s.status === 'Pełna').length;

  return (
    <div className="view-layout">

      {/* panel filtrów */}
      <aside className="filter-panel">
        <div className="filter-section">
          <div className="filter-title">Status</div>
          {[
            { label: 'Wszystkie', count: MOCK_STREFY.length },
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

        <div className="filter-section">
          <div className="filter-title">Liczba miejsc</div>
          {[
            { label: 'Do 8 miejsc',  fn: (s: typeof MOCK_STREFY[0]) => s.miejsca <= 8 },
            { label: '9–15 miejsc',  fn: (s: typeof MOCK_STREFY[0]) => s.miejsca > 8 && s.miejsca <= 15 },
            { label: 'Powyżej 15',   fn: (s: typeof MOCK_STREFY[0]) => s.miejsca > 15 },
          ].map(opt => (
            <label key={opt.label} className="filter-option">
              <input type="checkbox" />
              <span>{opt.label}</span>
              <span className="filter-count">{MOCK_STREFY.filter(opt.fn).length}</span>
            </label>
          ))}
        </div>

        {/* przycisk wyczyść gdy coś aktywne */}
        {(statusFilter !== 'Wszystkie' || sortBy !== 'domyslnie') && (
          <button className="filter-clear" onClick={() => { setStatusFilter('Wszystkie'); setSortBy('domyslnie'); }}>
            ✕ Wyczyść filtry
          </button>
        )}
      </aside>

      <div className="listing-main">
        {/* pasek podsumowania */}
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
            <div className="listing-card" key={s.id}>

              {/* zdjęcie z tagiem i serduszkiem */}
              <div className="listing-img-wrap">
                <img src={s.img} alt={s.nazwa} className="listing-img" />
                {s.tag && <span className="listing-tag">{s.tag}</span>}
                <button
                  className={`heart-btn ${ulubione.includes(s.id) ? 'active' : ''}`}
                  onClick={() => toggleUlubione(s.id)}
                  title="Dodaj do ulubionych"
                >
                  {ulubione.includes(s.id) ? '♥' : '♡'}
                </button>
              </div>

              <div className="listing-body">
                {/* breadcrumb */}
                <div className="listing-breadcrumb">Camping › Strefy › {s.nazwa.split('–')[0].trim()}</div>

                <div className="listing-top">
                  <div>
                    <h3 className="listing-title">{s.nazwa}</h3>
                    <Stars n={s.gwiazdki} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="listing-badge" style={{ background: 'none', border: 'none', color: '#888', fontSize: '0.78rem' }}>
                      Zobacz {s.liczbaOpinii} opinii
                    </span>
                    <ScoreBadge score={s.ocena} />
                  </div>
                </div>

                <p className="listing-desc">{s.opis}</p>
                <ul className="listing-features">
                  {s.cechy.map((c, i) => (
                    <li key={i}><span className="feat-dot">✓</span>{c}</li>
                  ))}
                </ul>
                <div className="listing-meta">
                  <span>🏕️ {s.miejsca} miejsc łącznie</span>
                  <span style={{ color: s.wolne === 0 ? '#e74c3c' : '#27ae60' }}>
                    ● {s.wolne === 0 ? 'Brak wolnych' : `${s.wolne} wolnych`}
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
                  {s.wolne > 0 ? `✓ ${s.wolne} dostępnych` : '✗ Brak miejsc'}
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
