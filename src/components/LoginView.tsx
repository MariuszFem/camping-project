import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/listing.module.css';

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
        // rola jest teraz dekodowana z tokenu JWT w AuthContext – nie przekazujemy jej z odpowiedzi
        login(result.token, result.imie, result.klientID?.toString());
        onLogin();
      } else {
        setError('root', { message: result.message || 'Błędny login lub hasło.' });
      }
    } catch {
      setError('root', { message: 'Brak połączenia z serwerem. Sprawdź czy backend działa.' });
    }
  };

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
                <span className={styles.formError}>{errors.login.message}</span>
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
                <span className={styles.formError}>{errors.haslo.message}</span>
              )}
            </div>
            {errors.root && (
              <div
                className={`login-error ${styles.loginRootError}`}
              >
                {errors.root.message}
              </div>
            )}
            <button type="submit" className="login-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Łączenie...' : 'Zaloguj się →'}
            </button>
            {onRegisterClick && (
              <div className={styles.registerPrompt}>
                Nie masz konta?{' '}
                <button
                  type="button"
                  onClick={onRegisterClick}
                  className={styles.registerLink}
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
