import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

// Dekoduje payload z tokenu JWT (bez weryfikacji podpisu – to robi backend)
function decodeJwt(token: string): Record<string, string> | null {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function getRolaFromToken(token: string | null): string {
  if (!token) return '';
  const payload = decodeJwt(token);
  if (!payload) return '';
  // ASP.NET Core umieszcza rolę pod tym kluczem
  return (
    payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
    payload['role'] ??
    payload['Role'] ??
    ''
  );
}

interface AuthState {
  isLoggedIn: boolean;
  userImie: string;
  rola: string;
  klientID: string | null;
  token: string | null;
}

interface AuthContextType extends AuthState {
  login: (token: string, imie: string, klientID?: string) => void;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const storedToken = localStorage.getItem('token');

  const [auth, setAuth] = useState<AuthState>({
    isLoggedIn: !!storedToken,
    userImie: localStorage.getItem('imie') || '',
    // rola pochodzi z tokenu, nie z localStorage – nie można jej podrobić
    rola: getRolaFromToken(storedToken),
    klientID: localStorage.getItem('klientID'),
    token: storedToken,
  });

  // Sygnatura login nie przyjmuje już roli – bierzemy ją z tokenu
  const login = (token: string, imie: string, klientID?: string) => {
    const rola = getRolaFromToken(token);
    localStorage.setItem('token', token);
    localStorage.setItem('imie', imie);
    if (klientID) localStorage.setItem('klientID', klientID);
    // roli celowo NIE zapisujemy do localStorage
    setAuth({ isLoggedIn: true, userImie: imie, rola, klientID: klientID ?? null, token });
  };

  const logout = () => {
    localStorage.removeItem('token');
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

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
