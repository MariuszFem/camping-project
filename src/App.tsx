/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';

import { StrefyView } from './components/StrefyView';
import { MiejscaView } from './components/MiejscaView';
import { KlienciView } from './components/KlienciView';
import { LoginView } from './components/LoginView';
import { MojeRezerwacjeView } from './components/MojeRezerwacjeView';
import { RejestracjaView } from './components/RejestracjaView';
import { PracownicyView } from './components/PracownicyView';
import { RezerwacjeAdminView } from './components/RezerwacjeAdminView';


function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [userImie, setUserImie] = useState<string>(localStorage.getItem('imie') || '');

  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = location.pathname.replace('/', '') || 'strefy';
  const rola = localStorage.getItem('rola'); // 'User', 'Pracownik', 'Admin'
  const isAdmin = rola === 'Admin' || rola === 'Pracownik';

  // Nawigacja zależna od roli
  const navItems = [
    { key: 'strefy',   label: 'Strefy',    always: true },
    { key: 'miejsca',  label: 'Miejsca',   always: true },
    { key: 'klienci',  label: 'Klienci',   admin: true },
    { key: 'pracownicy', label: 'Pracownicy', admin: true },
  ].filter(item => item.always || (item.admin && isAdmin));

  const handleNavClick = (path: string) => {
    setSearchTerm('');
    if (path === 'rezerwacje' && !isLoggedIn) {
      alert("Musisz być zalogowany!");
      navigate('/login');
      return;
    }
    navigate(`/${path}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rola');
    localStorage.removeItem('imie');
    localStorage.removeItem('klientID');
    setIsLoggedIn(false);
    setUserImie('');
    navigate('/strefy');
  };

  const handleLogin = (rola: string) => {
    setIsLoggedIn(true);
    setUserImie(localStorage.getItem('imie') || '');
    navigate('/strefy');
  };

  const isLightBg = activeTab === 'strefy' || activeTab === 'miejsca';
  const hideFooter = ['klienci', 'pracownicy', 'rezerwacje', 'moje-rezerwacje', 'login', 'rejestracja'].includes(activeTab);

  return (
    <div className="landing-page">
      <nav className="navbar">
        <div className="nav-left-group" style={{ display: 'flex', alignItems: 'center' }}>
          <span className="main-title" style={{ cursor: 'pointer' }} onClick={() => navigate('/strefy')}>CAMPING</span>
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
          {navItems.map(item => (
            <button
              key={item.key}
              className={`nav-btn ${activeTab === item.key ? 'active' : ''}`}
              onClick={() => handleNavClick(item.key)}
            >
              {item.label}
            </button>
          ))}
          {isLoggedIn && (
            <button
              className={`nav-btn btn-gold ${activeTab === (isAdmin ? 'rezerwacje' : 'moje-rezerwacje') ? 'active' : ''}`}
              onClick={() => handleNavClick(isAdmin ? 'rezerwacje' : 'moje-rezerwacje')}
            >
              {isAdmin ? 'Rezerwacje' : 'Moje rezerwacje'}
            </button>
          )}
        </div>

        <div className="nav-right">
          {isLoggedIn ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: '#86efac' }}>
              {userImie || 'Użytkownik'}
              <button className="logout-link" onClick={handleLogout}>Wyloguj</button>
            </span>
          ) : (
            <button className="nav-btn" onClick={() => handleNavClick('login')}>
              Logowanie
            </button>
          )}
        </div>
      </nav>

      <main className={`main-content ${isLightBg ? 'main-light' : ''}`} style={{ width: '100%', padding: '20px' }}>
        <Routes>
          <Route path="/" element={<StrefyView searchTerm={searchTerm} />} />
          <Route path="/strefy" element={<StrefyView searchTerm={searchTerm} />} />
          <Route path="/miejsca" element={<MiejscaView searchTerm={searchTerm} />} />
          <Route path="/klienci" element={<KlienciView searchTerm={searchTerm} />} />
          <Route path="/pracownicy" element={<PracownicyView searchTerm={searchTerm} />} />
          <Route path="/rezerwacje" element={<RezerwacjeAdminView searchTerm={searchTerm} />} />
          <Route path="/moje-rezerwacje" element={<MojeRezerwacjeView />} />
          <Route path="/login" element={<LoginView onLogin={handleLogin} onRegisterClick={() => navigate('/rejestracja')} />} />
          <Route path="/rejestracja" element={<RejestracjaView onSuccess={() => navigate('/login')} onLoginClick={() => navigate('/login')} />} />
          <Route path="*" element={<div style={{ textAlign: 'center', padding: '5rem', color: '#94a3b8' }}><h2>404 – Strona nie istnieje</h2></div>} />
        </Routes>
      </main>

      {!hideFooter && (
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
                <p>kontakt@camping.pl</p>
                <p>+48 123 456 789</p>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
