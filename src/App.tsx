import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { MdOutlineTerrain, MdOutlineCabin, MdPeople, MdBadge, MdEventNote } from 'react-icons/md';
import './App.css';
import { StrefyView } from './components/ZonesView';
import { MiejscaView } from './components/SpotsView';
import { KlienciView } from './components/ClientsView';
import { LoginView } from './components/LoginView';
import { MojeRezerwacjeView } from './components/MyReservationsView';
import { RejestracjaView } from './components/RegisterView';
import { PracownicyView } from './components/EmployeesView';
import { RezerwacjeAdminView } from './components/ReservationsAdminView';
import { StrefaDetailView } from './components/ZoneDetailView';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

function App() {
  const [searchTerm, setSearchTerm] = useState('');

  const { isLoggedIn, userImie, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = location.pathname.replace('/', '') || 'strefy';

  const navItems = [
    { key: 'strefy', label: 'Strefy', icon: <MdOutlineTerrain size={18} />, always: true },
    { key: 'miejsca', label: 'Miejsca', icon: <MdOutlineCabin size={18} />, always: true },
    { key: 'klienci', label: 'Klienci', icon: <MdPeople size={18} />, admin: true },
    { key: 'pracownicy', label: 'Pracownicy', icon: <MdBadge size={18} />, admin: true },
  ].filter(item => item.always || (item.admin && isAdmin));

  const handleNavClick = (path: string) => {
    setSearchTerm('');
    if (path === 'rezerwacje' && !isLoggedIn) {
      alert('Musisz być zalogowany!');
      navigate('/login');
      return;
    }
    navigate(`/${path}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/strefy');
  };

  const handleLogin = () => {
    navigate('/strefy');
  };

  const isLightBg = [
    'strefy',
    'miejsca',
    'klienci',
    'pracownicy',
    'rezerwacje',
    'moje-rezerwacje',
  ].includes(activeTab);
  const hideFooter = [
    'klienci',
    'pracownicy',
    'rezerwacje',
    'moje-rezerwacje',
    'login',
    'rejestracja',
  ].includes(activeTab);

  return (
    <div className="landing-page">
      <nav className="navbar">
        <div className="nav-left-group">
          <span className="main-title nav-title-clickable" onClick={() => navigate('/strefy')}>
            CAMPING
          </span>
          <div className="nav-search-container">
            <input
              type="text"
              placeholder="Szukaj"
              className="navbar-search-input"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
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
              <span className="nav-btn-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
          {isLoggedIn && (
            <button
              className={`nav-btn btn-gold ${activeTab === (isAdmin ? 'rezerwacje' : 'moje-rezerwacje') ? 'active' : ''}`}
              onClick={() => handleNavClick(isAdmin ? 'rezerwacje' : 'moje-rezerwacje')}
            >
              <span className="nav-btn-icon">
                <MdEventNote size={18} />
              </span>
              {isAdmin ? 'Rezerwacje' : 'Moje rezerwacje'}
            </button>
          )}
        </div>

        <div className="nav-right">
          {isLoggedIn ? (
            <span className="nav-user-info">
              {userImie || 'Użytkownik'}
              <button className="logout-link" onClick={handleLogout}>
                Wyloguj
              </button>
            </span>
          ) : (
            <button className="nav-btn" onClick={() => handleNavClick('login')}>
              Logowanie
            </button>
          )}
        </div>
      </nav>

      <main className={`main-content ${isLightBg ? 'main-light' : ''}`}>
        <Routes>
          <Route path="/" element={<StrefyView searchTerm={searchTerm} />} />
          <Route path="/strefy" element={<StrefyView searchTerm={searchTerm} />} />
          <Route path="/strefy/:id" element={<StrefaDetailView />} />
          <Route path="/miejsca" element={<MiejscaView searchTerm={searchTerm} />} />

          <Route
            path="/klienci"
            element={
              <ProtectedRoute adminOnly>
                <KlienciView searchTerm={searchTerm} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pracownicy"
            element={
              <ProtectedRoute adminOnly>
                <PracownicyView searchTerm={searchTerm} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rezerwacje"
            element={
              <ProtectedRoute adminOnly>
                <RezerwacjeAdminView searchTerm={searchTerm} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/moje-rezerwacje"
            element={
              <ProtectedRoute requireAuth>
                <MojeRezerwacjeView />
              </ProtectedRoute>
            }
          />

          <Route
            path="/login"
            element={
              <LoginView onLogin={handleLogin} onRegisterClick={() => navigate('/rejestracja')} />
            }
          />
          <Route
            path="/rejestracja"
            element={
              <RejestracjaView
                onSuccess={() => navigate('/login')}
                onLoginClick={() => navigate('/login')}
              />
            }
          />
          <Route
            path="*"
            element={
              <div className="page-404">
                <h2>404 – Strona nie istnieje</h2>
              </div>
            }
          />
        </Routes>
      </main>

      {!hideFooter && (
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-col">
              <h4 className="footer-title">Obsługa Klienta</h4>
              <ul className="footer-links">
                <li>
                  <a href="#faq">FAQ &amp; Kontakt</a>
                </li>
                <li>
                  <a href="#rezerwacje">Warunki rezerwacji</a>
                </li>
                <li>
                  <a href="#bezpieczenstwo">Bezpieczeństwo rezerwacji</a>
                </li>
                <li>
                  <a href="#onas">O nas</a>
                </li>
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
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon facebook"
                >
                  <span>f</span>
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon youtube"
                >
                  <span>▶</span>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon instagram"
                >
                  <span>📷</span>
                </a>
              </div>
              <div className="footer-contact">
                <p>
                  <strong>Kontakt:</strong>
                </p>
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
