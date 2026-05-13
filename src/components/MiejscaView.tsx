import { MOCK_MIEJSCA } from '../data/mockData.ts';

/* prop searchTerm – tekst z wyszukiwarki w navbarze */
export function MiejscaView({ searchTerm = '' }: { searchTerm?: string }) {
  /* filtrowanie po numerze, strefie i typie miejsca */
  const filtered = MOCK_MIEJSCA.filter(m =>
    `${m.numer} ${m.strefa} ${m.typ}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h2 className="section-title"> Miejsca campingowe</h2>
      <div className="cards-grid">
        {filtered.map(m => (
          <div className="card" key={m.id}>
            <div className="card-header">
              <span className="card-icon">
                {m.typ === 'Namiot' ? '' : m.typ === 'Kamper' ? '' : ''}
              </span>
              <div className="card-header-text">
                <div className="card-title">Miejsce {m.numer}</div>
                <div className="card-subtitle">{m.strefa} · {m.typ}</div>
              </div>
              <span className={`card-badge ${m.status === 'Wolne' ? 'green' : 'red'}`}>
                {m.status}
              </span>
            </div>
            <div className="card-stats">
              <div className="stat">
                <span className="stat-label">Wymiary</span>
                <span className="stat-value">{m.wymiary}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Prąd</span>
                <span className="stat-value">{m.prąd ? '⚡ Tak' : '✗ Nie'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}