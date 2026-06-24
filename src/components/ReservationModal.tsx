import { useState } from 'react';
import api from '../api/axiosInstance';

interface Props {
  miejsceID: number;
  nazwaLokalizacji: string;
  cenaZaDobe: number;
  onClose: () => void;
  onSuccess: () => void;
}

interface Pogoda {
  temp_max: number;
  temp_min: number;
  opady: number;
  opis: string;
  ikona: string;
}

const weatherCodeToInfo = (code: number): { opis: string; ikona: string } => {
  if (code === 0) return { opis: 'Słonecznie', ikona: '☀️' };
  if (code <= 3) return { opis: 'Pochmurno', ikona: '⛅' };
  if (code <= 49) return { opis: 'Mgła', ikona: '🌫️' };
  if (code <= 69) return { opis: 'Deszcz', ikona: '🌧️' };
  if (code <= 79) return { opis: 'Śnieg', ikona: '❄️' };
  if (code <= 99) return { opis: 'Burza', ikona: '⛈️' };
  return { opis: 'Nieznana', ikona: '🌡️' };
};

export function RezerwacjaModal({
  miejsceID,
  nazwaLokalizacji,
  cenaZaDobe,
  onClose,
  onSuccess,
}: Props) {
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({ dataPrzyjazdu: '', dataWyjazdu: '', liczbaOsob: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pogoda, setPogoda] = useState<Pogoda | null>(null);
  const [pogodaLoading, setPogodaLoading] = useState(false);

  const klientID = parseInt(localStorage.getItem('klientID') || '0');
  const isLoggedIn = !!localStorage.getItem('token');

  const handleDatePrzyjazdu = async (data: string) => {
    setForm(prev => ({ ...prev, dataPrzyjazdu: data }));
    if (!data) return;
    setPogodaLoading(true);
    setPogoda(null);
    try {
      const res = await api.get(`/Pogoda?data=${data}`);
      const json = res.data;
      const info = weatherCodeToInfo(json.weatherCode ?? 0);
      setPogoda({
        temp_max: json.tempMax ?? 0,
        temp_min: json.tempMin ?? 0,
        opady: json.opady ?? 0,
        ...info,
      });
    } catch {
      // ignorowane — pogoda jest opcjonalna
    } finally {
      setPogodaLoading(false);
    }
  };

  const liczbaDni =
    form.dataPrzyjazdu && form.dataWyjazdu
      ? Math.max(
          0,
          Math.ceil(
            (new Date(form.dataWyjazdu).getTime() - new Date(form.dataPrzyjazdu).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
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
      await api.post('/Rezerwacje/add', {
        klientID: klientID || 1,
        miejsceID,
        dataRezerwacji: new Date().toISOString(),
        dataPrzyjazdu: new Date(form.dataPrzyjazdu).toISOString(),
        dataWyjazdu: new Date(form.dataWyjazdu).toISOString(),
        liczbaOsob: form.liczbaOsob,
        status: 'Nowa',
      });
      onSuccess();
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(msg || 'Błąd podczas składania rezerwacji.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Rezerwacja</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
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
                onChange={e => handleDatePrzyjazdu(e.target.value)}
              />
            </div>
            <div className="modal-field">
              <label>Wyjazd</label>
              <input
                type="date"
                min={form.dataPrzyjazdu || today}
                required
                value={form.dataWyjazdu}
                onChange={e => setForm(prev => ({ ...prev, dataWyjazdu: e.target.value }))}
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
              onChange={e => setForm(prev => ({ ...prev, liczbaOsob: parseInt(e.target.value) }))}
            />
          </div>

          {pogodaLoading && <div className="weather-loading">🌡️ Pobieranie prognozy pogody...</div>}

          {pogoda && !pogodaLoading && (
            <div className="weather-widget">
              <div className="weather-label">Prognoza pogody na dzień przyjazdu (Mazury)</div>
              <div className="weather-body">
                <span className="weather-icon">{pogoda.ikona}</span>
                <div>
                  <div className="weather-desc">{pogoda.opis}</div>
                  <div className="weather-details">
                    🌡️ {pogoda.temp_min}°C – {pogoda.temp_max}°C &nbsp;|&nbsp; 💧 Opady:{' '}
                    {pogoda.opady} mm
                  </div>
                </div>
              </div>
            </div>
          )}

          {liczbaDni > 0 && (
            <div className="modal-summary">
              <span>
                {liczbaDni} {liczbaDni === 1 ? 'noc' : 'nocy'} × {cenaZaDobe} zł
              </span>
              <span className="modal-total">{sumaDoZaplaty} zł</span>
            </div>
          )}

          {error && <div className="modal-error">{error}</div>}

          {!isLoggedIn && <div className="modal-warning">Zaloguj się żeby złożyć rezerwację.</div>}

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
