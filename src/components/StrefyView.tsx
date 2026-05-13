import { MOCK_STREFY } from '../data/mockData.ts';

/* prop searchTerm – tekst z wyszukiwarki w navbarze */
export function StrefyView({ searchTerm = '' }: { searchTerm?: string }) {
  /* filtrowanie po nazwie i opisie strefy */
  const filtered = MOCK_STREFY.filter(s =>
    `${s.nazwa} ${s.opis}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h2 className="section-title">Strefy campingowe</h2>
      <div className="cards-grid">
        {filtered.map(s => (
          <div className="card" key={s.id}>
            <div className="card-header">
              <span className="card-icon"></span>
              <div className="card-header-text">
                <div className="card-title">{s.nazwa}</div>
                <div className="card-subtitle">{s.opis}</div>
              </div>
              <span className={`card-badge ${s.status === 'Dostępna' ? 'green' : 'red'}`}>
                {s.status}
              </span>
            </div>
            <div className="card-stats">
              <div className="stat">
                <span className="stat-label">Wszystkich miejsc</span>
                <span className="stat-value">{s.miejsca}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Wolnych</span>
                <span className="stat-value" style={{ color: s.wolne === 0 ? '#fca5a5' : '#86efac' }}>
                  {s.wolne}
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">Zajętych</span>
                <span className="stat-value">{s.miejsca - s.wolne}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}