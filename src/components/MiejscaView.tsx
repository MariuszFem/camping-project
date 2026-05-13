import { useState } from 'react';
import { MOCK_MIEJSCA } from '../data/mockData.ts';

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
  return <span className="score-badge" style={{ background: color }}>{score.toFixed(1)}</span>;
}

export function MiejscaView({ searchTerm = '' }: { searchTerm?: string }) {
  const [typFilter, setTypFilter]   = useState('Wszystkie');
  const [pradFilter, setPradFilter] = useState<boolean | null>(null);
  const [sortBy, setSortBy]         = useState('domyslnie');
  const [ulubione, setUlubione]     = useState<number[]>([]);

  let filtered = MOCK_MIEJSCA.filter(m =>
    `${m.numer} ${m.strefa} ${m.typ}`.toLowerCase().includes(searchTerm.toLowerCase())
  );
  if (typFilter !== 'Wszystkie') filtered = filtered.filter(m => m.typ === typFilter);
  if (pradFilter !== null)       filtered = filtered.filter(m => m.prąd === pradFilter);
  if (sortBy === 'cena-asc')     filtered = [...filtered].sort((a,b) => a.cenaOd - b.cenaOd);
  if (sortBy === 'cena-desc')    filtered = [...filtered].sort((a,b) => b.cenaOd - a.cenaOd);
  if (sortBy === 'ocena')        filtered = [...filtered].sort((a,b) => b.ocena - a.ocena);

  const toggleUlubione = (id: number) =>
    setUlubione(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const typIcon = (typ: string) => typ === 'Namiot' ? '⛺' : typ === 'Kamper' ? '🚐' : '🚌';
  const typy = ['Wszystkie', 'Namiot', 'Kamper', 'Przyczepa'];
  const minCena = filtered.length > 0 ? Math.min(...filtered.map(m => m.cenaOd)) : 0;

  return (
    <div className="view-layout">

      <aside className="filter-panel">
        <div className="filter-section">
          <div className="filter-title">Typ miejsca</div>
          {typy.map(t => (
            <label key={t} className="filter-option">
              <input type="radio" name="typ" checked={typFilter === t}
                onChange={() => setTypFilter(t)} />
              <span>{t}</span>
              <span className="filter-count">
                {t === 'Wszystkie' ? MOCK_MIEJSCA.length : MOCK_MIEJSCA.filter(m => m.typ === t).length}
              </span>
            </label>
          ))}
        </div>

        <div className="filter-section">
          <div className="filter-title">Prąd</div>
          {[
            { label: 'Wszystkie', val: null },
            { label: 'Z prądem',  val: true },
            { label: 'Bez prądu', val: false },
          ].map(opt => (
            <label key={opt.label} className="filter-option">
              <input type="radio" name="prad" checked={pradFilter === opt.val}
                onChange={() => setPradFilter(opt.val)} />
              <span>{opt.label}</span>
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
          ].map(opt => (
            <label key={opt.val} className="filter-option">
              <input type="radio" name="sort" checked={sortBy === opt.val}
                onChange={() => setSortBy(opt.val)} />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>

        {(typFilter !== 'Wszystkie' || pradFilter !== null || sortBy !== 'domyslnie') && (
          <button className="filter-clear"
            onClick={() => { setTypFilter('Wszystkie'); setPradFilter(null); setSortBy('domyslnie'); }}>
            ✕ Wyczyść filtry
          </button>
        )}
      </aside>

      <div className="listing-main">
        <div className="summary-bar">
          <span>Znaleziono <b>{filtered.length}</b> {filtered.length === 1 ? 'miejsce' : 'miejsc'}</span>
          {filtered.length > 0 && <span>Ceny od <b>{minCena} zł</b> / noc</span>}
        </div>

        <div className="listing-header">
          <h2 className="section-title" style={{ margin: 0 }}>Miejsca campingowe</h2>
          <span className="listing-count">{filtered.length} wyników</span>
        </div>

        <div className="listing-grid">
          {filtered.map(m => (
            <div className="listing-card" key={m.id}>

              <div className="listing-img-wrap">
                <img src={m.img} alt={m.numer} className="listing-img" />
                {m.tag && <span className="listing-tag">{m.tag}</span>}
                <button
                  className={`heart-btn ${ulubione.includes(m.id) ? 'active' : ''}`}
                  onClick={() => toggleUlubione(m.id)}
                >
                  {ulubione.includes(m.id) ? '♥' : '♡'}
                </button>
              </div>

              <div className="listing-body">
                <div className="listing-breadcrumb">
                  Camping › {m.strefa} › Miejsce {m.numer}
                </div>
                <div className="listing-top">
                  <div>
                    <h3 className="listing-title">{typIcon(m.typ)} Miejsce {m.numer}</h3>
                    <Stars n={m.gwiazdki} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#888', fontSize: '0.78rem' }}>
                      Zobacz {m.liczbaOpinii} opinii
                    </span>
                    <ScoreBadge score={m.ocena} />
                  </div>
                </div>
                <p className="listing-desc">{m.strefa} · {m.typ} · {m.wymiary}</p>
                <ul className="listing-features">
                  {m.cechy.map((c, i) => (
                    <li key={i}><span className="feat-dot">✓</span>{c}</li>
                  ))}
                </ul>
                <div className="listing-meta">
                  <span>📐 {m.wymiary}</span>
                  <span>{m.prąd ? '⚡ Prąd w cenie' : '— Bez prądu'}</span>
                </div>
              </div>

              <div className="listing-price-box">
                <div className="listing-price-label">Od</div>
                <div className="listing-price">{m.cenaOd} zł<span>/noc</span></div>
                <button
                  className={`listing-btn ${m.status !== 'Wolne' ? 'disabled' : ''}`}
                  disabled={m.status !== 'Wolne'}
                >
                  {m.status === 'Wolne' ? 'Rezerwuj' : 'Zajęte'}
                </button>
                <div className="listing-avail">
                  {m.status === 'Wolne' ? '✓ Dostępne' : '✗ Niedostępne'}
                </div>
              </div>

            </div>
          ))}
          {filtered.length === 0 && (
            <div className="empty-state" style={{ color: '#888' }}>Brak wyników.</div>
          )}
        </div>
      </div>
    </div>
  );
}
