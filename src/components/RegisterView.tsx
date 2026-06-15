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

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 10,
  padding: '13px 16px',
  color: 'white',
  fontSize: '0.95rem',
  outline: 'none',
  fontFamily: 'inherit',
  width: '100%',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

const errorStyle: React.CSSProperties = {
  color: '#fca5a5',
  fontSize: '0.78rem',
  marginTop: 2,
};

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
  const haslo = watch('haslo');

  return (
    <div className="login-page">
      <div
        style={{
          display: 'flex',
          width: '100%',
          maxWidth: 900,
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 20,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
        }}
      >
        {/* Lewa strona */}
        <div
          style={{
            background: 'rgba(0,0,0,0.3)',
            padding: '60px 40px',
            width: '38%',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ fontSize: '3.5rem', marginBottom: 16 }}></div>
          <h2 style={{ fontFamily: 'Impact, sans-serif', fontSize: '1.8rem', letterSpacing: 3, margin: '0 0 8px' }}>
            CAMPING
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: 32 }}>
            Utwórz konto i zarezerwuj miejsce
          </p>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              textAlign: 'left',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.88rem',
            }}
          >
            <li>✓ Rezerwacja online 24/7</li>
            <li>✓ Podgląd swoich rezerwacji</li>
            <li>✓ Szybkie anulowanie</li>
            <li>✓ Bezpieczne konto</li>
          </ul>
        </div>

        {/* Prawa strona */}
        <div style={{ padding: '50px', flex: 1 }}>
          <h3 style={{ fontSize: '1.7rem', fontWeight: 700, margin: '0 0 4px' }}>Rejestracja</h3>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem', margin: '0 0 28px' }}>
            Wypełnij formularz żeby założyć konto
          </p>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }} noValidate>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <input
                  style={inputStyle}
                  placeholder="Imię *"
                  {...register('imie', { required: 'Imię jest wymagane' })}
                />
                {errors.imie && <p style={errorStyle}>{errors.imie.message}</p>}
              </div>
              <div>
                <input
                  style={inputStyle}
                  placeholder="Nazwisko *"
                  {...register('nazwisko', { required: 'Nazwisko jest wymagane' })}
                />
                {errors.nazwisko && <p style={errorStyle}>{errors.nazwisko.message}</p>}
              </div>
              <div>
                <input
                  style={inputStyle}
                  type="email"
                  placeholder="Email"
                  {...register('email', {
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Nieprawidłowy email' },
                  })}
                />
                {errors.email && <p style={errorStyle}>{errors.email.message}</p>}
              </div>
              <div>
                <input
                  style={inputStyle}
                  type="tel"
                  placeholder="Telefon"
                  {...register('telefon')}
                />
              </div>
            </div>

            <div>
              <input
                style={inputStyle}
                placeholder="Login *"
                {...register('login', {
                  required: 'Login jest wymagany',
                  minLength: { value: 3, message: 'Login musi mieć co najmniej 3 znaki' },
                })}
              />
              {errors.login && <p style={errorStyle}>{errors.login.message}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <input
                  style={inputStyle}
                  type="password"
                  placeholder="Hasło *"
                  {...register('haslo', {
                    required: 'Hasło jest wymagane',
                    minLength: { value: 4, message: 'Hasło musi mieć co najmniej 4 znaki' },
                  })}
                />
                {errors.haslo && <p style={errorStyle}>{errors.haslo.message}</p>}
              </div>
              <div>
                <input
                  style={inputStyle}
                  type="password"
                  placeholder="Powtórz hasło *"
                  {...register('haslo2', {
                    required: 'Powtórz hasło',
                    validate: value => value === haslo || 'Hasła nie są zgodne',
                  })}
                />
                {errors.haslo2 && <p style={errorStyle}>{errors.haslo2.message}</p>}
              </div>
            </div>

            {errors.root && (
              <div
                style={{
                  background: 'rgba(220,38,38,0.15)',
                  border: '1px solid #dc2626',
                  borderRadius: 8,
                  padding: '10px 14px',
                  color: '#fca5a5',
                  fontSize: '0.88rem',
                }}
              >
                {errors.root.message}
              </div>
            )}

            {isSubmitSuccessful && !errors.root && (
              <div
                style={{
                  background: 'rgba(22,163,74,0.15)',
                  border: '1px solid #16a34a',
                  borderRadius: 8,
                  padding: '12px 14px',
                  color: '#86efac',
                  textAlign: 'center',
                  fontWeight: 600,
                }}
              >
                  Konto utworzone! Przekierowuję do logowania...
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || isSubmitSuccessful}
              style={{
                background: '#2563eb',
                color: 'white',
                padding: '14px',
                borderRadius: 10,
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '1rem',
                fontFamily: 'inherit',
                opacity: isSubmitting || isSubmitSuccessful ? 0.7 : 1,
                transition: 'background 0.2s',
              }}
            >
              {isSubmitting ? 'Rejestrowanie...' : 'Zarejestruj się →'}
            </button>

            <p
              style={{
                textAlign: 'center',
                fontSize: '0.85rem',
                color: 'rgba(255,255,255,0.45)',
                margin: 0,
              }}
            >
              Masz już konto?{' '}
              <button
                type="button"
                onClick={onLoginClick}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#60a5fa',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                }}
              >
                Zaloguj się
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
