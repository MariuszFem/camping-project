import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';

interface LoginViewProps {
  onLogin: () => void;
  onRegisterClick?: () => void;
}

interface LoginFormData {
  login: string;
  haslo: string;
}

export function LoginView({ onLogin, onRegisterClick }: LoginViewProps) {
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await fetch('http://localhost:5050/api/Auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        login(result.token, result.rola, result.imie, result.klientID?.toString());
        onLogin();
      } else {
        setError('root', { message: result.message || 'Błędny login lub hasło.' });
      }
    } catch {
      setError('root', { message: 'Brak połączenia z serwerem. Sprawdź czy backend działa.' });
    }  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card-left">
          <div className="login-brand-icon"></div>
          <h2 className="login-brand-title">CAMPING</h2>
          <p className="login-brand-sub">System zarządzania campingiem</p>
        </div>
        <div className="login-card-right">
          <h3 className="login-title">Zaloguj się</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="login-form" noValidate>
            <div className="input-group">
              <input
                type="text"
                placeholder="Login"
                {...register('login', { required: 'Login jest wymagany' })}
              />
              {errors.login && (
                <span style={{ color: '#ff4d4d', fontSize: '0.8rem' }}>{errors.login.message}</span>
              )}
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="Hasło"
                {...register('haslo', {
                  required: 'Hasło jest wymagane',
                  minLength: { value: 4, message: 'Hasło musi mieć co najmniej 4 znaki' },
                })}
              />
              {errors.haslo && (
                <span style={{ color: '#ff4d4d', fontSize: '0.8rem' }}>{errors.haslo.message}</span>
              )}
            </div>
            {errors.root && (
              <div
                className="login-error"
                style={{ color: '#ff4d4d', marginBottom: '1rem', fontSize: '0.9rem' }}
              >
                {errors.root.message}
              </div>
            )}
            <button type="submit" className="login-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Łączenie...' : 'Zaloguj się →'}
            </button>
            {onRegisterClick && (
              <div
                style={{
                  textAlign: 'center',
                  fontSize: '0.85rem',
                  color: '#94a3b8',
                  marginTop: '0.5rem',
                }}
              >
                Nie masz konta?{' '}
                <button
                  type="button"
                  onClick={onRegisterClick}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#60a5fa',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontFamily: 'inherit',
                  }}
                >
                  Zarejestruj się
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
