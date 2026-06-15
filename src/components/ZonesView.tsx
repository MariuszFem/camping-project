
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RezerwacjaModal } from './ReservationModal';
import api from '../api/axiosInstance';
import {
  MdOutlineWifi, MdOutlineLocalParking, MdOutlinePool,
  MdOutlineShower, MdOutlineElectricBolt, MdOutlinePets,
  MdOutlinePlayCircle, MdOutlineRestaurant, MdOutlineLocalFireDepartment,
  MdPeopleAlt, MdEventAvailable, MdEventBusy,
  MdOutlineForest, MdOutlineWater, MdOutlineLocationCity,
  MdOutlineStars, MdOutlineFamilyRestroom, MdOutlineNightsStay
} from 'react-icons/md';

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

interface MiejsceWStrefie {
  miejsceID: number;
  numerMiejsca: string;
  typ: string;
  cenaZaDobe: number;
  status: string;
  wymiary: string;
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

function CechaIcon({ cecha }: { cecha: string }) {
  const lower = cecha.toLowerCase();
  if (lower.includes('wifi') || lower.includes('wi-fi') || lower.includes('internet'))
    return <MdOutlineWifi size={15} style={{ flexShrink: 0 }} />;
  if (lower.includes('parking'))
    return <MdOutlineLocalParking size={15} style={{ flexShrink: 0 }} />;
  if (lower.includes('basen') || lower.includes('pool'))
    return <MdOutlinePool size={15} style={{ flexShrink: 0 }} />;
  if (lower.includes('prysznic') || lower.includes('sanitarny') || lower.includes('łazienka'))
    return <MdOutlineShower size={15} style={{ flexShrink: 0 }} />;
  if (lower.includes('prąd') || lower.includes('elektryczn'))
    return <MdOutlineElectricBolt size={15} style={{ flexShrink: 0 }} />;
  if (lower.includes('zwierz') || lower.includes('pies') || lower.includes('kot'))
    return <MdOutlinePets size={15} style={{ flexShrink: 0 }} />;
  if (lower.includes('plac') || lower.includes('dzieci') || lower.includes('play'))
    return <MdOutlinePlayCircle size={15} style={{ flexShrink: 0 }} />;
  if (lower.includes('restauracj') || lower.includes('jedzenie') || lower.includes('bar'))
    return <MdOutlineRestaurant size={15} style={{ flexShrink: 0 }} />;
  if (lower.includes('ognisko') || lower.includes('grill'))
    return <MdOutlineLocalFireDepartment size={15} style={{ flexShrink: 0 }} />;
  return <span className="feat-dot" style={{ flexShrink: 0 }}>✓</span>;
}

function StrefaIcon({ nazwa }: { nazwa: string }) {
  const lower = nazwa.toLowerCase();
  const style = { flexShrink: 0, color: '#64748b' };
  if (lower.includes('leśn') || lower.includes('las'))
    return <MdOutlineForest size={22} style={style} />;
  if (lower.includes('jezior') || lower.includes('wod') || lower.includes('plaż'))
    return <MdOutlineWater size={22} style={style} />;
  if (lower.includes('central') || lower.includes('główn'))
    return <MdOutlineLocationCity size={22} style={style} />;
  if (lower.includes('premium') || lower.includes('vip') || lower.includes('lux'))
    return <MdOutlineStars size={22} style={style} />;
  if (lower.includes('rodzin') || lower.includes('dzieci'))
    return <MdOutlineFamilyRestroom size={22} style={style} />;
  if (lower.includes('cicha') || lower.includes('spokojn') || lower.includes('nocna'))
    return <MdOutlineNightsStay size={22} style={style} />;
  return <MdOutlineForest size={22} style={style} />;
}

export function StrefyView({ searchTerm = '' }: { searchTerm?: string }) {
  const [strefy, setStrefy] = useState<Strefa[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Wszystkie');
  const [sortBy, setSortBy]             = useState('domyslnie');
  const [ulubione, setUlubione]         = useState<number[]>([]);
  const [wybranaStrefa, setWybranaStrefa] = useState<Strefa | null>(null);
  const [miejscaStrefy, setMiejscaStrefy] = useState<MiejsceWStrefie[]>([]);
  const [loadingMiejsca, setLoadingMiejsca] = useState(false);
  const [modalMiejsce, setModalMiejsce] = useState<MiejsceWStrefie | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    api
      .get<Strefa[]>('/Strefy/list')
      .then(res => setStrefy(res.data))
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

  const handleRezerwujStrefe = async (strefa: Strefa) => {
    setWybranaStrefa(strefa);
    setLoadingMiejsca(true);
    try {
      const res = await api.get<(MiejsceWStrefie & { strefaID: number })[]>('/Miejsca/list');
      const wolne = res.data.filter(m => m.strefaID === strefa.strefaID && m.status === 'Wolne');
      setMiejscaStrefy(wolne);
    } catch { setMiejscaStrefy([]); }
    finally { setLoadingMiejsca(false); }
  };

  const parseCechy = (cechy: string): string[] => {
    try { return JSON.parse(cechy); } catch { return []; }
  };

  const minCena = filtered.length > 0 ? Math.min(...filtered.map(s => Number(s.cenaOd))) : 0;
  const dostepne = strefy.filter(s => s.status === 'Dostępna').length;
  const pelne    = strefy.filter(s => s.status === 'Pełna').length;

  if (loading) return <div className="loader">Pobieranie stref...</div>;

  return (
    <div className="view-layout">
      {modalMiejsce && wybranaStrefa && (
        <RezerwacjaModal
          miejsceID={modalMiejsce.miejsceID}
          nazwaLokalizacji={`Miejsce ${modalMiejsce.numerMiejsca} – ${wybranaStrefa.nazwaStrefy}`}
          cenaZaDobe={modalMiejsce.cenaZaDobe}
          onClose={() => setModalMiejsce(null)}
          onSuccess={() => {
            setModalMiejsce(null);
            setWybranaStrefa(null);
            setSuccessMsg('Rezerwacja złożona pomyślnie!');
            setTimeout(() => setSuccessMsg(''), 4000);
          }}
        />
      )}

      {wybranaStrefa && !modalMiejsce && (
        <div className="modal-overlay" onClick={() => setWybranaStrefa(null)}>
          <div className="modal-card" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Wybierz miejsce</h3>
              <button className="modal-close" onClick={() => setWybranaStrefa(null)}>✕</button>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: 16 }}>
              Wolne miejsca w strefie: <b style={{ color: '#1e293b' }}>{wybranaStrefa.nazwaStrefy}</b>
            </p>
            {loadingMiejsca ? (
              <div style={{ color: '#64748b', padding: '1rem', textAlign: 'center' }}>Ładowanie miejsc...</div>
            ) : miejscaStrefy.length === 0 ? (
              <div style={{ color: '#64748b', padding: '1rem', textAlign: 'center' }}>Brak wolnych miejsc w tej strefie.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {miejscaStrefy.map(m => (
                  <div key={m.miejsceID} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>Miejsce {m.numerMiejsca}</div>
                      <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{m.typ} · {m.wymiary}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontWeight: 700, color: '#2563eb' }}>{m.cenaZaDobe} zł/noc</span>
                      <button onClick={() => setModalMiejsce(m)}
                        style={{ background: '#e67e00', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>
                        Rezerwuj
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {successMsg && <div className="success-toast">{successMsg}</div>}

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
          <h2 className="section-title" style={{ margin: 0 }}></h2>
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
                    <h3 className="listing-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <StrefaIcon nazwa={s.nazwaStrefy} />
                      {s.nazwaStrefy}
                    </h3>
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
                    <li key={i}><CechaIcon cecha={c} />{c}</li>
                  ))}
                </ul>
                <div className="listing-meta">
                  <span><MdPeopleAlt size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />{s.miejscaLacznie} miejsc łącznie</span>
                  <span style={{ color: s.wolneMiejsca === 0 ? '#e74c3c' : '#27ae60' }}>
                    {s.wolneMiejsca === 0
                      ? <><MdEventBusy size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />Brak wolnych</>
                      : <><MdEventAvailable size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />{s.wolneMiejsca} wolnych</>
                    }
                  </span>
                </div>
              </div>

              <div className="listing-price-box">
                <div className="listing-price-label">Od</div>
                <div className="listing-price">{s.cenaOd} zł<span>/noc</span></div>
                <button
                  className={`listing-btn ${s.status !== 'Dostępna' ? 'disabled' : ''}`}
                  disabled={s.status !== 'Dostępna'}
                  onClick={() => s.status === 'Dostępna' && handleRezerwujStrefe(s)}
                >
                  {s.status === 'Dostępna' ? 'Rezerwuj' : 'Niedostępna'}
                </button>
                <button
                  onClick={() => navigate(`/strefy/${s.strefaID}`)}
                  style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'inherit', marginTop: 4, textDecoration: 'underline' }}
                >
                  Szczegóły →
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
