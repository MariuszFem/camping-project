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
  Nowa: '#2563eb',
  Potwierdzona: '#16a34a',
  Anulowana: '#dc2626',
  Zakończona: '#64748b',
};

export function MojeRezerwacjeView() {
  const [rezerwacje, setRezerwacje] = useState<Rezerwacja[]>([]);
  const [loading, setLoading] = useState(true);
  const [anulowanieID, setAnulowanieID] = useState<number | null>(null);

  const klientID = localStorage.getItem('klientID');

  const fetchRezerwacje = useCallback(() => {
    if (!klientID) {
      setLoading(false);
      return;
    }
    api
      .get(`/Rezerwacje/moje/${klientID}`)
      .then(res => setRezerwacje(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [klientID]);

  useEffect(() => {
    fetchRezerwacje();
  }, [fetchRezerwacje]);

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
    <div className="my-rez-wrapper">
      <h2 className="section-title">Moje rezerwacje</h2>

      {rezerwacje.length === 0 ? (
        <div className="my-rez-empty">
          <div className="my-rez-empty-icon"></div>
          <p className="my-rez-empty-title">Nie masz jeszcze żadnych rezerwacji.</p>
          <p className="my-rez-empty-sub">
            Przejdź do zakładki Miejsca i zarezerwuj swoje miejsce.
          </p>
        </div>
      ) : (
        <div className="my-rez-list">
          {rezerwacje.map(r => {
            const dni = liczbaDni(r.dataPrzyjazdu, r.dataWyjazdu);
            return (
              <div key={r.rezerwacjaID} className="my-rez-card">
                <div className="my-rez-card-left">
                  <div className="my-rez-place">Miejsce {r.numerMiejsca}</div>
                  <div className="my-rez-zone">{r.nazwaStrefy}</div>
                  <div className="my-rez-dates">
                    {formatDate(r.dataPrzyjazdu)} → {formatDate(r.dataWyjazdu)}
                    <span className="my-rez-nights">
                      ({dni} {dni === 1 ? 'noc' : 'nocy'})
                    </span>
                  </div>
                  <div className="my-rez-persons">
                    Liczba osób: <b>{r.liczbaOsob}</b>
                  </div>
                </div>

                <div className="my-rez-card-right">
                  {/* Kolor statusu jest dynamiczny – musi zostać jako inline */}
                  <span
                    className="my-rez-status-badge"
                    style={{ background: statusColor[r.status] || '#475569' }}
                  >
                    {r.status}
                  </span>
                  <div className="my-rez-id">#{r.rezerwacjaID}</div>
                  {r.status === 'Nowa' && (
                    <button
                      className="my-rez-cancel-btn"
                      disabled={anulowanieID === r.rezerwacjaID}
                      onClick={() => handleAnuluj(r.rezerwacjaID)}
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
