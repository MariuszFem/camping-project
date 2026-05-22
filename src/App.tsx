/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import './App.css';

import { NAV_ITEMS } from './data/mockData.ts';
import { StrefyView } from './components/StrefyView';
import { MiejscaView } from './components/MiejscaView';
import { KlienciView } from './components/KlienciView';
import { LoginView } from './components/LoginView';

function App() {
  const [activeTab, setActiveTab] = useState<string>('Strefy');
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [userImie, setUserImie] = useState<string>(localStorage.getItem('imie') || '');

  const handleNavClick = async (tabName: string) => {
    setSearchTerm('');
    if (tabName === 'Rezerwacje' && !isLoggedIn) {
      alert("Musisz być zalogowany!");
      setActiveTab('Login');
      return;
    }
    setActiveTab(tabName);
    setData([]);
    
    // Jeśli te widoki mają własne komponenty pobierające dane, pomijamy fetch w App.tsx
    if (['Strefy', 'Miejsca', 'Login', 'Klienci'].includes(tabName)) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // TabName musi być dokładnie takie, jak nazwa kontrolera w ASP.NET, czyli np. 'Pracownik'
      const response = await fetch(`http://localhost:5050/api/${tabName}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`Błąd serwera: ${response.status}`);
      }

      const result = await response.json();
      if (Array.isArray(result)) setData(result);
    } catch (error) {
      console.error("Błąd pobierania danych:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rola');
    localStorage.removeItem('imie');
    setIsLoggedIn(false);
    setUserImie('');
    setActiveTab('Strefy');
  };

  const handleLogin = (rola: string) => {
    setIsLoggedIn(true);
    setUserImie(localStorage.getItem('imie') || '');
    setActiveTab(rola === 'admin' ? 'Rezerwacje' : 'Strefy');
  };

  const formatValue = (val: any) => {
    if (val === null || val === undefined) return '—';
    if (typeof val === 'boolean') return val ? 'Tak' : 'Nie';
    if (typeof val === 'string' && val.includes('T') && !isNaN(Date.parse(val)))
      return new Date(val).toLocaleString('pl-PL');
    return val.toString();
  };

  return (
    <div className="landing-page">
      <nav className="navbar">
        <div className="nav-left-group" style={{ display: 'flex', alignItems: 'center' }}>
          <span className="main-title">CAMPING</span>
          <div className="nav-search-container">
            <input
              type="text"
              placeholder="Szukaj"
              className="navbar-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon-inline"></span>
          </div>
        </div>

        <div className="nav-center">
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              className={`nav-btn ${activeTab === item.key ? 'active' : ''}`}
              onClick={() => handleNavClick(item.key)}
            >
              {item.label}
            </button>
          ))}
          <button className="nav-btn btn-gold" onClick={() => handleNavClick('Rezerwacje')}>
            REZERWACJE
          </button>
        </div>

        <div className="nav-right">
          {isLoggedIn ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: '#86efac' }}>
               {userImie || 'Użytkownik'}
              <button className="logout-link" onClick={handleLogout}>Wyloguj</button>
            </span>
          ) : (
            <button className="nav-btn" onClick={() => handleNavClick('Login')}>
               Logowanie
            </button>
          )}
        </div>
      </nav>

      <main className={`main-content ${(activeTab === 'Strefy' || activeTab === 'Miejsca') ? 'main-light' : ''}`} style={{ width: '100%', padding: '20px' }}>
        {activeTab === 'Strefy'  && <StrefyView  searchTerm={searchTerm} />}
        {activeTab === 'Miejsca' && <MiejscaView searchTerm={searchTerm} />}
        {activeTab === 'Klienci' && <KlienciView searchTerm={searchTerm} />}

        {activeTab === 'Login' && <LoginView onLogin={handleLogin} />}

        {/* NAPRAWIONE: Zmieniono 'Pracownick' na 'Pracownik' */}
        {(activeTab === 'Pracownik' || activeTab === 'Rezerwacje') && (
          <div>
            <h2 className="section-title">{activeTab === 'Pracownik' ? 'Pracownicy' : activeTab}</h2>
            {loading ? (
              <div className="loader">Pobieranie danych...</div>
            ) : data.length > 0 ? (
              <div className="table-container">
                <table className="modern-table">
                  <thead>
                    <tr>{Object.keys(data[0]).map(k => (
                      <th key={k}>{k.replace(/([A-Z])/g, ' $1').toUpperCase()}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {data.map((item, idx) => (
                      <tr key={idx}>{Object.values(item).map((val, i) => (
                        <td key={i}>{formatValue(val)}</td>
                      ))}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">Brak danych w sekcji {activeTab === 'Pracownik' ? 'Pracownicy' : activeTab}.</div>
            )}
          </div>
        )}
      </main>
      
      {activeTab !== 'Klienci' && (
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-col">
            <h4 className="footer-title">Obsługa Klienta</h4>
            <ul className="footer-links">
              <li><a href="#faq">FAQ & Kontakt</a></li>
              <li><a href="#rezerwacje">Warunki rezerwacji</a></li>
              <li><a href="#bezpieczenstwo">Bezpieczeństwo rezerwacji</a></li>
              <li><a href="#onas">O nas</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">Oferty Specjalne</h4>
            <p className="footer-desc">
              Aby otrzymywać najnowsze oferty wakacyjne, zapisz się do naszego newslettera
            </p>
            <div className="newsletter-form">
              <input type="email" placeholder="E-mail" className="newsletter-input" />
              <button className="newsletter-btn">Zapisz się</button>
            </div>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">Obserwuj nas</h4>
            <div className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon facebook">
                <span>f</span>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon youtube">
                <span>▶</span>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon instagram">
                <span>📷</span>
              </a>
            </div>
            <div className="footer-contact">
              <p><strong>Kontakt:</strong></p>
              <p> kontakt@camping.pl</p>
              <p> +48 123 456 789</p>
            </div>
          </div>
        </div>
      </footer>
      )}
    </div>
  );
}

export default App;