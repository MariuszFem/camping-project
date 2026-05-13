/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import './App.css';
import './styles/search.css'; 

import { NAV_ITEMS } from './data/mockData.ts';
import { StrefyView } from './components/StrefyView';
import { MiejscaView } from './components/MiejscaView';
import { KlienciView } from './components/KlienciView';
import { LoginView } from './components/LoginView';

function App() {
  const [activeTab, setActiveTab] = useState<string>('Strefy');
  const [loading, setLoading] = useState(false);

  /* stan wyszukiwarki – wspólny dla wszystkich widoków */
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  const handleNavClick = async (tabName: string) => {
    /* reset wyszukiwarki przy każdej zmianie zakładki */
    setSearchTerm('');
    if (tabName === 'Rezerwacje' && !isLoggedIn) {
      alert("Musisz być zalogowany!");
      setActiveTab('Login');
      return;
    }
    setActiveTab(tabName);
    if (['Strefy', 'Miejsca', 'Login', 'Klienci'].includes(tabName)) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5050/api/${tabName}`, {
          headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      console.log(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
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
          <button className="nav-btn btn-gold" onClick={() => handleNavClick('Rezerwacje')}>REZERWACJE</button>
        </div>

        <div className="nav-right">
          <button className="nav-btn">🔑 Logowanie</button>
        </div>
      </nav>

      <main className="main-content" style={{ width: '100%', padding: '20px' }}>
        {activeTab === 'Strefy'  && <StrefyView  searchTerm={searchTerm} />}
        {activeTab === 'Miejsca' && <MiejscaView searchTerm={searchTerm} />}
        {activeTab === 'Klienci' && <KlienciView searchTerm={searchTerm} />}
        
        {activeTab === 'Login' && <LoginView onLogin={(_rola) => { setIsLoggedIn(true); setActiveTab('Strefy'); }} />}

        {(activeTab === 'Pracownicy' || activeTab === 'Rezerwacje') && (
          <div className="table-section">
            <h2 className="section-title">{activeTab}</h2>
            {loading && <div className="loader">Pobieranie danych...</div>}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;