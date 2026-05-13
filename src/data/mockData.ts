export const MOCK_KLIENCI = [
  { id: 1, imie: 'Anna', nazwisko: 'Kowalska', email: 'anna.k@email.com', telefon: '600 100 200', rezerwacje: 3 },
  { id: 2, imie: 'Marek', nazwisko: 'Nowak', email: 'marek.n@email.com', telefon: '601 200 300', rezerwacje: 1 },
  { id: 3, imie: 'Zofia', nazwisko: 'Wiśniewska', email: 'zofia.w@email.com', telefon: '602 300 400', rezerwacje: 5 },
  { id: 4, imie: 'Piotr', nazwisko: 'Zając', email: 'piotr.z@email.com', telefon: '603 400 500', rezerwacje: 2 },
  { id: 5, imie: 'Katarzyna', nazwisko: 'Lewandowska', email: 'kasia.l@email.com', telefon: '604 500 600', rezerwacje: 0 },
];

export const MOCK_STREFY = [
  { id: 1, nazwa: 'Strefa A – Leśna', opis: 'Spokojna strefa w cieniu drzew', miejsca: 12, wolne: 5, status: 'Dostępna' },
  { id: 2, nazwa: 'Strefa B – Jeziorna', opis: 'Bezpośredni dostęp do jeziora', miejsca: 8, wolne: 0, status: 'Pełna' },
  { id: 3, nazwa: 'Strefa C – Centralna', opis: 'Blisko recepcji i sanitariatów', miejsca: 20, wolne: 11, status: 'Dostępna' },
  { id: 4, nazwa: 'Strefa D – Premium', opis: 'Prąd, Wi-Fi, utwardzone podłoże', miejsca: 6, wolne: 2, status: 'Dostępna' },
  { id: 5, nazwa: 'Strefa E – Rodzinna', opis: 'Plac zabaw w pobliżu', miejsca: 10, wolne: 3, status: 'Dostępna' },
  { id: 6, nazwa: 'Strefa F – Cicha', opis: 'Cisza nocna od 21:00', miejsca: 8, wolne: 0, status: 'Pełna' },
];

export const MOCK_MIEJSCA = [
  { id: 1, numer: 'A-01', strefa: 'Strefa A', typ: 'Namiot', wymiary: '5×5 m', prąd: false, status: 'Wolne' },
  { id: 2, numer: 'A-02', strefa: 'Strefa A', typ: 'Kamper', wymiary: '8×4 m', prąd: true, status: 'Zajęte' },
  { id: 3, numer: 'B-01', strefa: 'Strefa B', typ: 'Namiot', wymiary: '4×4 m', prąd: false, status: 'Zajęte' },
  { id: 4, numer: 'C-01', strefa: 'Strefa C', typ: 'Kamper', wymiary: '10×5 m', prąd: true, status: 'Wolne' },
  { id: 5, numer: 'C-02', strefa: 'Strefa C', typ: 'Przyczepa', wymiary: '7×4 m', prąd: true, status: 'Wolne' },
  { id: 6, numer: 'D-01', strefa: 'Strefa D', typ: 'Kamper', wymiary: '12×5 m', prąd: true, status: 'Zajęte' },
  { id: 7, numer: 'D-02', strefa: 'Strefa D', typ: 'Kamper', wymiary: '10×5 m', prąd: true, status: 'Wolne' },
  { id: 8, numer: 'E-01', strefa: 'Strefa E', typ: 'Namiot', wymiary: '5×5 m', prąd: false, status: 'Wolne' },
];

export const NAV_ITEMS = [
  { key: 'Strefy', label: 'Strefy', icon: '' },
  { key: 'Miejsca', label: 'Miejsca', icon: '' },
  { key: 'Klienci', label: 'Klienci', icon: '' },
  { key: 'Pracownicy', label: 'Pracownicy', icon: '' },
];