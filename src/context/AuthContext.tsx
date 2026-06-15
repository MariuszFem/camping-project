import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface AuthState {
  isLoggedIn: boolean;
  userImie: string;
  rola: string;
  klientID: string | null;
  token: string | null;
}


interface AuthContextType extends AuthState {
  login: (token: string, rola: string, imie: string, klientID?: string) => void;
  logout: () => void;
  isAdmin: boolean; 
}

const AuthContext = createContext<AuthContextType | null>(null);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    isLoggedIn: !!localStorage.getItem('token'),
    userImie: localStorage.getItem('imie') || '',
    rola: localStorage.getItem('rola') || '',
    klientID: localStorage.getItem('klientID'),
    token: localStorage.getItem('token'),
  });

  
  const login = (token: string, rola: string, imie: string, klientID?: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('rola', rola);
    localStorage.setItem('imie', imie);
    if (klientID) localStorage.setItem('klientID', klientID);
    setAuth({ isLoggedIn: true, userImie: imie, rola, klientID: klientID || null, token });
  };

 
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rola');
    localStorage.removeItem('imie');
    localStorage.removeItem('klientID');
    setAuth({ isLoggedIn: false, userImie: '', rola: '', klientID: null, token: null });
  };

  const isAdmin = auth.rola === 'Admin' || auth.rola === 'Pracownik';

  return (
    <AuthContext.Provider value={{ ...auth, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
