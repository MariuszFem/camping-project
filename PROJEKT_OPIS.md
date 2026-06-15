# Opis projektu — Camping App (React + TypeScript)

Dokument opisuje co zostało zrobione w projekcie, jak to działa i jak zademonstrować każde wymaganie.

---

## Struktura projektu

```
reactapp1.client/
├── src/
│   ├── api/
│   │   └── axiosInstance.ts        ← NOWY — centralna konfiguracja Axios
│   ├── context/
│   │   └── AuthContext.tsx         ← NOWY — globalny stan logowania (Context API)
│   ├── components/
│   │   ├── ZoneDetailView.tsx      ← NOWY — widok szczegółów strefy (/strefy/:id)
│   │   ├── LoginView.tsx           ← ZMIENIONY — React Hook Form
│   │   ├── RegisterView.tsx        ← ZMIENIONY — React Hook Form
│   │   ├── ZonesView.tsx           ← ZMIENIONY — Axios, link do szczegółów
│   │   ├── SpotsView.tsx           ← ZMIENIONY — Axios
│   │   ├── ClientsView.tsx         ← ZMIENIONY — Axios, useCallback
│   │   ├── EmployeesView.tsx       ← ZMIENIONY — Axios, useCallback
│   │   ├── MyReservationsView.tsx  ← ZMIENIONY — Axios, useCallback
│   │   ├── ReservationsAdminView.tsx ← ZMIENIONY — Axios, useCallback
│   │   └── ReservationModal.tsx    ← ZMIENIONY — Axios
│   ├── App.tsx                     ← ZMIENIONY — useAuth(), trasa /strefy/:id
│   └── main.tsx                    ← ZMIENIONY — dodano <AuthProvider>
├── .prettierrc                     ← NOWY — konfiguracja formattera
├── eslint.config.js                ← ZMIENIONY — ignoruje folder camping-project
└── package.json                    ← ZMIENIONY — skrypty format/format:check
```

> `camping-project/` — stary duplikat projektu, nieużywany, można usunąć.

---

## 6 wymagań — co zrobiono i jak pokazać

---

### 1/6 — Routing (`react-router-dom`)

**Co jest:**
- `BrowserRouter` w `main.tsx` opakowuje całą aplikację
- `<Routes>` i `<Route>` w `App.tsx` definiują trasy
- Nawigacja przez `useNavigate()` i przyciski — bez przeładowania strony
- Trasa 404 na końcu (`path="*"`)
- **`useParams()`** w `ZoneDetailView.tsx` — parametr `:id` z URL

**Trasy w aplikacji:**
```
/              → lista stref
/strefy        → lista stref
/strefy/:id    → szczegóły konkretnej strefy ← useParams() tutaj
/miejsca       → lista miejsc
/klienci       → panel klientów (admin)
/pracownicy    → panel pracowników (admin)
/rezerwacje    → zarządzanie rezerwacjami (admin)
/moje-rezerwacje → rezerwacje zalogowanego klienta
/login         → logowanie
/rejestracja   → rejestracja
/cokolwiek     → 404
```

**Jak zademonstrować `useParams()`:**
1. Wejdź na stronę `/strefy`
2. Kliknij przycisk **"Szczegóły →"** na dowolnej karcie strefy
3. URL zmienia się na `/strefy/3` (lub inny numer ID)
4. Strona wyświetla dane tej konkretnej strefy — pobrała je używając ID z URL
5. Wpisz ręcznie w pasek adresu `/strefy/9999` — pojawi się komunikat "Nie znaleziono strefy"
6. Wpisz `/randomowasciezka` — pojawi się strona 404

**Kod w `ZoneDetailView.tsx`:**
```tsx
// useParams() odczytuje :id z adresu URL
const { id } = useParams<{ id: string }>();

// Następnie używamy tego ID żeby znaleźć konkretną strefę
api.get('/Strefy/list').then(res => {
  const found = res.data.find(s => s.strefaID === Number(id));
});
```

---

### 2/6 — Zarządzanie stanem (Context API)

**Co jest:**
- `AuthContext.tsx` — globalny stan: czy zalogowany, imię, rola, token
- `AuthProvider` opakowuje całą aplikację w `main.tsx`
- `useAuth()` — własny hook do odczytu stanu w dowolnym komponencie

**Czym jest `useAuth()`:**

`useAuth` to funkcja napisana w `AuthContext.tsx`. Nie pochodzi z żadnej biblioteki.
Jej jedynym zadaniem jest wyciągnąć dane z kontekstu:

```tsx
export function useAuth() {
  const ctx = useContext(AuthContext); // sięga do "pojemnika" z danymi
  return ctx; // zwraca: isLoggedIn, userImie, isAdmin, login(), logout()
}
```

Dzięki temu w każdym komponencie zamiast czytać localStorage z osobna:
```tsx
// STARE — nieaktywne, nie powoduje re-renderu
const isLoggedIn = !!localStorage.getItem('token');
```
Piszesz:
```tsx
// NOWE — reaktywne, zmiana = natychmiastowy re-render wszędzie
const { isLoggedIn, userImie, isAdmin, logout } = useAuth();
```

**Jak to działa w praktyce:**
```
main.tsx
└── <AuthProvider>          ← trzyma stan: { isLoggedIn, token, rola... }
    └── <App>
        ├── Navbar           ← useAuth() → pokazuje imię lub "Logowanie"
        ├── LoginView        ← useAuth() → wywołuje login() po zalogowaniu
        └── (inne widoki)    ← useAuth() → dostęp do tych samych danych
```

**Jak zademonstrować:**
1. Nie jesteś zalogowany → navbar pokazuje przycisk "Logowanie"
2. Zaloguj się → `LoginView` wywołuje `login()` z AuthContext
3. Navbar **natychmiast** (bez przeładowania) pokazuje imię użytkownika
4. Kliknij "Wyloguj" → `logout()` czyści dane → navbar wraca do "Logowanie"

To jest dowód że stan jest globalny i reaktywny — zmiana w jednym miejscu
aktualizuje wszystkie komponenty które go używają.

---

### 3/6 — Pobieranie danych z API (Axios)

**Co jest:**
- `axiosInstance.ts` — centralna instancja Axios z `baseURL` i interceptorem JWT
- Wszystkie komponenty używają `api.get/post/put/delete` zamiast `fetch()`

**Czym jest Axios:**

Axios to biblioteka do requestów HTTP. Robi to samo co `fetch()` ale wygodniej:

```tsx
// STARE — fetch, ręczne parsowanie, ręczny nagłówek
const token = localStorage.getItem('token');
const res = await fetch('http://localhost:5050/api/Strefy/list', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await res.json();

// NOWE — Axios, automatyczny JSON, token dodawany przez interceptor
const res = await api.get('/Strefy/list');
const data = res.data; // JSON już sparsowany
```

**Interceptor** — kod który odpala się automatycznie przed każdym requestem:
```tsx
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config; // każdy request dostaje nagłówek Authorization automatycznie
});
```
Dlatego usunięto `const token = localStorage.getItem('token')` ze wszystkich
komponentów — jest zbędne, interceptor robi to za nie.

**Jak zademonstrować:**
1. Otwórz DevTools → zakładka **Network**
2. Wejdź na `/strefy` → widać request `GET /api/Strefy/list`
3. Wejdź na `/miejsca` → widać request `GET /api/Miejsca/list`
4. Zaloguj się i wejdź na `/moje-rezerwacje` → widać request z nagłówkiem `Authorization: Bearer ...`
5. W aplikacji: dane się ładują (stan "Pobieranie stref..."), potem wyświetlają

---

### 4/6 — Formularze z walidacją (React Hook Form)

**Co jest:**
- `LoginView.tsx` — formularz logowania z RHF
- `RegisterView.tsx` — formularz rejestracji z RHF i walidacją każdego pola

**Czym jest React Hook Form:**

Zamiast `useState` dla każdego pola i ręcznej walidacji:
```tsx
// STARE — masa stanu
const [login, setLogin] = useState('');
const [haslo, setHaslo] = useState('');
const [error, setError] = useState('');
// + ręczna walidacja w handleSubmit
```

RHF rejestruje pola przez `register()` bez re-renderów:
```tsx
// NOWE — register podpina pole, walidacja deklaratywna
const { register, handleSubmit, formState: { errors } } = useForm();

<input {...register('login', { required: 'Login jest wymagany' })} />
{errors.login && <span>{errors.login.message}</span>}
```

**Walidacja w formularzu rejestracji:**
- `imie`, `nazwisko` — wymagane
- `login` — wymagany, minimum 3 znaki
- `email` — sprawdzany pattern (format `x@x.x`)
- `haslo` — wymagane, minimum 4 znaki
- `haslo2` — musi być identyczne jak `haslo`

**Jak zademonstrować:**
1. Wejdź na `/rejestracja`
2. Kliknij "Zarejestruj się →" **bez wypełniania niczego**
3. Pod każdym wymaganym polem pojawią się czerwone błędy
4. Wpisz złe hasła (np. `abc` i `xyz`) → błąd "Hasła nie są zgodne"
5. Wpisz za krótkie hasło (np. `ab`) → błąd "Hasło musi mieć co najmniej 4 znaki"
6. To samo na `/login` — puste pola pokazują błędy walidacji

---

### 5/6 — UI / Stylowanie

**Co jest:**
- Custom CSS w folderze `src/styles/`
- Spójny design: ciemne tło, kolory akcentujące (niebieski `#2563eb`, pomarańczowy `#e67e00`)
- Karty, filtry, modalne, nawigacja — wszystko własny CSS

**Jak zademonstrować:**
- Pokaż że wygląd nie jest domyślnym stylem przeglądarki
- Spójne kolory i typografia we wszystkich widokach
- Responsywny grid w kartach stref i miejsc

---

### 6/6 — ESLint + Prettier

**Co jest:**
- `eslint.config.js` — konfiguracja ESLint z regułami dla TypeScript i React
- `.prettierrc` — zasady formatowania kodu
- Skrypt `npm run lint` → 0 errors, 0 warnings
- Skrypt `npm run format` → automatyczne formatowanie wszystkich plików

**`.prettierrc` — co oznaczają ustawienia:**
```json
{
  "semi": true,         // średniki na końcu linii: console.log("x");
  "singleQuote": true,  // apostrofy: 'tekst' zamiast "tekst"
  "tabWidth": 2,        // wcięcia: 2 spacje
  "trailingComma": "es5", // przecinek po ostatnim elemencie w obiektach/tablicach
  "printWidth": 100     // łamanie linii po 100 znakach
}
```

**Jak zademonstrować:**
1. Otwórz terminal w folderze projektu
2. Wpisz: `npm run lint`
3. Wynik: brak błędów, brak ostrzeżeń — czysto
4. Możesz też pokazać `eslint.config.js` i `.prettierrc` jako dowód konfiguracji

---

## Kluczowe pojęcia — krótkie wyjaśnienia

### `useCallback`
Zapamiętuje funkcję między renderami komponentu. Bez niego React tworzy nową
funkcję przy każdym renderze, co powodowałoby nieskończoną pętlę w `useEffect`.

```tsx
// Bez useCallback — nowa funkcja przy każdym renderze = pętla
const fetchData = () => { api.get(...) }
useEffect(() => { fetchData() }, [fetchData]) // ← ciągle odpala

// Z useCallback — funkcja tworzona raz
const fetchData = useCallback(() => { api.get(...) }, [])
useEffect(() => { fetchData() }, [fetchData]) // ← odpala raz
```

### `package.json`
Plik konfiguracyjny projektu. Zawiera:
- skrypty (`npm run dev`, `npm run build`, `npm run lint`)
- listę bibliotek (`dependencies` — produkcja, `devDependencies` — tylko development)

### `package-lock.json`
Automatycznie generowany. Zapisuje dokładne wersje zainstalowanych paczek.
Gwarantuje że `npm install` u innej osoby zainstaluje identyczne wersje. Nie edytujesz go ręcznie.

### Interceptor Axios
Kod który odpala się automatycznie przed każdym requestem HTTP.
W tym projekcie dołącza token JWT do nagłówka `Authorization` — zastępuje
ręczne pisanie nagłówka w każdym komponencie.

---

## Jak uruchomić projekt

```bash
# instalacja zależności
npm install

# uruchomienie w trybie deweloperskim
npm run dev

# sprawdzenie błędów lintowania
npm run lint

# formatowanie kodu
npm run format

# build produkcyjny
npm run build
```

Backend C# musi działać na `http://localhost:5050` — wszystkie requesty
idą tam przez Axios (`baseURL` w `axiosInstance.ts`).
