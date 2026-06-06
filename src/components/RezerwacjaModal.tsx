import { useState } from 'react';

interface Props {
  miejsceID: number;
  nazwaLokalizacji: string;
  cenaZaDobe: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function RezerwacjaModal({ miejsceID, nazwaLokalizacji, cenaZaDobe, onClose, onSuccess }: Props) {
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    dataPrzyjazdu: '',
    dataWyjazdu: '',
    liczbaOsob: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const klientID = parseInt(localStorage.getItem('klientID') || '0');
  const isLoggedIn = !!localStorage.getItem('token');

  const liczbaDni = form.dataPrzyjazdu && form.dataWyjazdu
    ? Math.max(0, Math.ceil(
        (new Date(form.dataWyjazdu).getTime() - new Date(form.dataPrzyjazdu).getTime())
        / (1000 * 60 * 60 * 24)
      ))
    : 0;

  const sumaDoZaplaty = liczbaDni * Number(cenaZaDobe);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isLoggedIn) {
      setError('Musisz być zalogowany żeby złożyć rezerwację.');
      return;
    }

    if (!form.dataPrzyjazdu || !form.dataWyjazdu) {
      setError('Wybierz daty przyjazdu i wyjazdu.');
      return;
    }

    if (new Date(form.dataWyjazdu) <= new Date(form.dataPrzyjazdu)) {
      setError('Data wyjazdu musi być późniejsza niż przyjazdu.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5050/api/Rezerwacje/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          klientID: klientID || 1,
          miejsceID,
          dataRezerwacji: new Date().toISOString(),
          dataPrzyjazdu: new Date(form.dataPrzyjazdu).toISOString(),
          dataWyjazdu: new Date(form.dataWyjazdu).toISOString(),
          liczbaOsob: form.liczbaOsob,
          status: 'Nowa'
        })
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.message || 'Błąd podczas składania rezerwacji.');
      }
    } catch {
      setError('Brak połączenia z serwerem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Rezerwacja</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-location">
          <span className="modal-location-name">{nazwaLokalizacji}</span>
          <span className="modal-price">{cenaZaDobe} zł / noc</span>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-row">
            <div className="modal-field">
              <label>Przyjazd</label>
              <input
                type="date"
                min={today}
                required
                value={form.dataPrzyjazdu}
                onChange={e => setForm({ ...form, dataPrzyjazdu: e.target.value })}
              />
            </div>
            <div className="modal-field">
              <label>Wyjazd</label>
              <input
                type="date"
                min={form.dataPrzyjazdu || today}
                required
                value={form.dataWyjazdu}
                onChange={e => setForm({ ...form, dataWyjazdu: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-field">
            <label>Liczba osób</label>
            <input
              type="number"
              min={1}
              max={10}
              value={form.liczbaOsob}
              onChange={e => setForm({ ...form, liczbaOsob: parseInt(e.target.value) })}
            />
          </div>

          {liczbaDni > 0 && (
            <div className="modal-summary">
              <span>{liczbaDni} {liczbaDni === 1 ? 'noc' : 'nocy'} × {cenaZaDobe} zł</span>
              <span className="modal-total">{sumaDoZaplaty} zł</span>
            </div>
          )}

          {error && <div className="modal-error">{error}</div>}

          {!isLoggedIn && (
            <div className="modal-warning">
              Zaloguj się żeby złożyć rezerwację.
            </div>
          )}

          <button
            type="submit"
            className="modal-submit-btn"
            disabled={loading || !isLoggedIn || !!error}
          >
            {loading ? 'Składanie...' : 'Zarezerwuj'}
          </button>
        </form>
      </div>
    </div>
  );
}
