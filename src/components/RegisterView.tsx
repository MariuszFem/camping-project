import { useForm } from 'react-hook-form';

interface Props {
  onSuccess: () => void;
  onLoginClick: () => void;
}

interface RegisterFormData {
  imie: string;
  nazwisko: string;
  email: string;
  telefon: string;
  login: string;
  haslo: string;
  haslo2: string;
}

export function RejestracjaView({ onSuccess, onLoginClick }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<RegisterFormData>();

  const onSubmit = async (data: RegisterFormData) => {
    if (data.haslo !== data.haslo2) {
      setError('haslo2', { message: 'Hasła nie są zgodne.' });
      return;
    }
    try {
      const response = await fetch('http://localhost:5050/api/Klienci/rejestracja', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imie: data.imie,
          nazwisko: data.nazwisko,
          email: data.email,
          telefon: data.telefon,
          login: data.login,
          haslo: data.haslo,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        setTimeout(() => onSuccess(), 2000);
      } else {
        setError('root', { message: result.message || 'Błąd rejestracji.' });
      }
    } catch {
      setError('root', { message: 'Brak połączenia z serwerem.' });
    }
  };

  // eslint-disable-next-line react-hooks/incompatible-library
  const haslo = watch('haslo');

  return (
    <div className="login-page">
      <div className="register-card">
        {/* Lewa strona */}
        <div className="register-left">
          <div className="register-left-icon"></div>
          <h2 className="register-left-title">CAMPING</h2>
          <p className="register-left-sub">Utwórz konto i zarezerwuj miejsce</p>
          <ul className="register-left-list">
            <li>✓ Rezerwacja online 24/7</li>
            <li>✓ Podgląd swoich rezerwacji</li>
            <li>✓ Szybkie anulowanie</li>
            <li>✓ Bezpieczne konto</li>
          </ul>
        </div>

        {/* Prawa strona */}
        <div className="register-right">
          <h3 className="register-right-title">Rejestracja</h3>
          <p className="register-right-sub">Wypełnij formularz żeby założyć konto</p>

          <form onSubmit={handleSubmit(onSubmit)} className="register-form" noValidate>
            <div className="register-grid-2">
              <div>
                <input
                  className="register-input"
                  placeholder="Imię *"
                  {...register('imie', { required: 'Imię jest wymagane' })}
                />
                {errors.imie && <p className="register-field-error">{errors.imie.message}</p>}
              </div>
              <div>
                <input
                  className="register-input"
                  placeholder="Nazwisko *"
                  {...register('nazwisko', { required: 'Nazwisko jest wymagane' })}
                />
                {errors.nazwisko && (
                  <p className="register-field-error">{errors.nazwisko.message}</p>
                )}
              </div>
              <div>
                <input
                  className="register-input"
                  type="email"
                  placeholder="Email"
                  {...register('email', {
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Nieprawidłowy email',
                    },
                  })}
                />
                {errors.email && <p className="register-field-error">{errors.email.message}</p>}
              </div>
              <div>
                <input
                  className="register-input"
                  type="tel"
                  placeholder="Telefon"
                  {...register('telefon')}
                />
              </div>
            </div>

            <div>
              <input
                className="register-input"
                placeholder="Login *"
                {...register('login', {
                  required: 'Login jest wymagany',
                  minLength: { value: 3, message: 'Login musi mieć co najmniej 3 znaki' },
                })}
              />
              {errors.login && <p className="register-field-error">{errors.login.message}</p>}
            </div>

            <div className="register-grid-2">
              <div>
                <input
                  className="register-input"
                  type="password"
                  placeholder="Hasło *"
                  {...register('haslo', {
                    required: 'Hasło jest wymagane',
                    minLength: { value: 4, message: 'Hasło musi mieć co najmniej 4 znaki' },
                  })}
                />
                {errors.haslo && <p className="register-field-error">{errors.haslo.message}</p>}
              </div>
              <div>
                <input
                  className="register-input"
                  type="password"
                  placeholder="Powtórz hasło *"
                  {...register('haslo2', {
                    required: 'Powtórz hasło',
                    validate: value => value === haslo || 'Hasła nie są zgodne',
                  })}
                />
                {errors.haslo2 && <p className="register-field-error">{errors.haslo2.message}</p>}
              </div>
            </div>

            {errors.root && <div className="register-error-box">{errors.root.message}</div>}

            {isSubmitSuccessful && !errors.root && (
              <div className="register-success-box">
                Konto utworzone! Przekierowuję do logowania...
              </div>
            )}

            <button
              type="submit"
              className="register-submit-btn"
              disabled={isSubmitting || isSubmitSuccessful}
            >
              {isSubmitting ? 'Rejestrowanie...' : 'Zarejestruj się →'}
            </button>

            <p className="register-login-hint">
              Masz już konto?{' '}
              <button type="button" className="register-login-link" onClick={onLoginClick}>
                Zaloguj się
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
