# Armonia Wellness - Sistema di Gestione Prenotazioni

Un'applicazione web moderna e intuitiva per la gestione completa delle prenotazioni di un centro benessere, sviluppata con React 19, TypeScript e Tailwind CSS.

## 🚀 Caratteristiche Principali

### 🔐 Sistema di Autenticazione
- Login sicuro con credenziali protette (admin/admin)
- Interfaccia riservata al personale del centro
- Gestione sessioni utente con logout immediato

### 📅 Visualizzazioni Multiple
- **Vista Giornaliera**: Griglia oraria dettagliata con slot da 30 minuti
- **Vista Settimanale**: Panoramica settimanale completa con navigazione giorni
- **Vista Mensile**: Calendario mensile con indicatori di occupazione

### ✨ Gestione Prenotazioni Completa (CRUD)
- ✅ **Creazione**: Nuove prenotazioni con validazione completa dei dati
- 📝 **Visualizzazione**: Display in tempo reale di tutte le prenotazioni
- 🔄 **Modifica**: Aggiornamento appuntamenti esistenti
- 🗑️ **Cancellazione**: Rimozione prenotazioni con conferma di sicurezza

### 🕒 Sistema Orari Intelligente
- **Configurazione centralizzata** tramite file di impostazioni
- **Orari lavorativi**:
  - Lunedì-Venerdì: 9:00-13:00 e 14:00-18:00
  - Sabato: 9:00-13:00 (solo mattina)
  - Domenica: Chiuso
- **Pausa pranzo automatica**: 13:00-14:00
- **Slot configurabili**: Durata 30 minuti (personalizzabile)
- **Validazione oraria**: Controlli automatici di disponibilità

### 🚫 Prevenzione Conflitti Avanzata
- Controllo automatico sovrapposizioni temporali
- Validazione durata trattamenti vs orari disponibili
- Prevenzione prenotazioni durante pause pranzo
- Gestione intelligente slot temporali consecutivi
- Blocco prenotazioni in date/orari passati

### 💼 Gestione Trattamenti
- **5 Categorie**: Massaggi, Trattamenti Viso, Corpo, Wellness
- **Trattamenti disponibili**:
  - Massaggio Rilassante (60 min) - €80
  - Massaggio Sportivo (45 min) - €70
  - Trattamento Viso (30 min) - €50
  - Trattamento Corpo (90 min) - €120
  - Sauna (45 min) - €40
- **Durate personalizzabili** per ogni tipo di trattamento
- **Prezzi dinamici** per categoria

### 👥 Gestione Clienti
- **Informazioni complete**: Nome, telefono, email obbligatoria
- **Validazione email** con controllo formato
- **Note personalizzate** per ogni appuntamento
- **Status tracking**: Confermato/In attesa

### 📊 Dashboard e Statistiche
- **Contatori in tempo reale**:
  - Prenotazioni del giorno
  - Prenotazioni totali
  - Orario medio utilizzo
  - Trend settimanale
- **Indicatori visivi** di stato per ogni prenotazione
- **Badge colorati** per status (Confermata: verde, In attesa: giallo)

### 📱 Design Responsive Completo
- **Mobile-first**: Ottimizzato per smartphone
- **Tablet-friendly**: Layout adattivo per dispositivi medi
- **Desktop**: Interfaccia completa per schermi grandi
- **Touch**: Navigazione ottimizzata per touch screen

### 🔧 Funzionalità Avanzate
- **Navigazione temporale intelligente**:
  - Frecce per spostarsi tra giorni/settimane/mesi
  - Pulsante "Oggi" per ritorno rapido
  - Indicatori visivi data corrente
- **Form dinamici** con validazione in tempo reale
- **Slot disponibilità** con indicatori visivi
- **Prevenzione errori** con messaggi informativi
- **Auto-refresh** dati appuntamenti

## 🛠️ Stack Tecnologico

- **Frontend**: React 19 + TypeScript 5.8
- **Styling**: Tailwind CSS 4 con configurazione personalizzata
- **Icone**: Lucide React per interfaccia moderna
- **Build**: Vite 7 per sviluppo e produzione
- **Linting**: ESLint con regole TypeScript
- **State Management**: React useState per gestione stato locale

## 📦 Installazione e Setup

### Prerequisiti
- Node.js 18+ e npm
- Git per clonazione repository

### 1. Clonazione Progetto
```bash
git clone <repository-url>
cd ArmoniaWellnessReact
```

### 2. Installazione Dipendenze
```bash
npm install
```

### 3. Avvio Sviluppo
```bash
npm run dev
```
L'applicazione sarà disponibile su `http://localhost:5173`

### 4. Build Produzione
```bash
npm run build
```

### 5. Anteprima Build
```bash
npm run preview
```

## 🔑 Credenziali di Accesso

- **Username**: `admin`
- **Password**: `admin`

## 📋 Struttura Progetto

```
src/
├── components/           # Componenti React riutilizzabili
│   ├── Login.tsx        # Autenticazione utente
│   ├── Navbar.tsx       # Barra navigazione
│   ├── Logo.tsx         # Logo personalizzabile
│   ├── Dashboard.tsx    # Dashboard principale con statistiche
│   ├── ViewSelector.tsx # Selettore modalità visualizzazione
│   ├── DateNavigator.tsx# Navigazione temporale
│   ├── AppointmentForm.tsx # Form gestione prenotazioni
│   ├── DayView.tsx      # Vista giornaliera dettagliata
│   ├── WeekView.tsx     # Vista settimanale
│   ├── MonthView.tsx    # Vista calendario mensile
│   ├── StatusBadge.tsx  # Badge stato prenotazioni
│   └── TimeSlotInfo.tsx # Informazioni slot temporali
├── config/              # Configurazioni sistema
│   ├── settings.ts      # Impostazioni centro benessere
│   └── workingHours.ts  # Logica orari lavorativi
├── types/               # Definizioni TypeScript
│   └── index.ts         # Interfacce e tipi applicazione
├── utils/               # Funzioni utility
│   └── utils.ts         # Helper per date e stringhe
├── App.tsx              # Componente principale
├── main.tsx             # Entry point applicazione
├── App.css              # Stili componente principale
└── index.css            # Stili globali e Tailwind
```

## 🎨 Personalizzazione

### Configurazione Orari
Modifica `src/config/settings.ts` per personalizzare:
- Orari apertura/chiusura per ogni giorno
- Durata slot prenotazioni (default: 30 min)
- Giorni di anticipo massimo prenotazioni
- Politiche cancellazione

```typescript
export const CENTER_SETTINGS = {
  defaultWorkingHours: {
    monday: { start: '08:00', end: '12:00', afternoonStart: '13:00', afternoonEnd: '19:00' },
    // ... personalizza per ogni giorno
  },
  booking: {
    slotDuration: 15, // Cambia a slot da 15 minuti
    maxAdvanceBooking: 60, // Prenotazioni fino a 60 giorni
  }
};
```

### Aggiunta Trattamenti
Estendi l'array `sampleTreatments` in `Dashboard.tsx`:
```typescript
const newTreatment: Treatment = {
  id: '6',
  name: 'Massaggio Californiano',
  duration: 75,
  price: 95,
  category: 'massage'
};
```

### Personalizzazione UI
- **Logo**: Modifica props `variant` e `size` in `Logo.tsx`
- **Colori**: Personalizza palette in `tailwind.config.js`
- **Lingua**: Cambia `language` in `CENTER_SETTINGS`

## 📱 Guida Utilizzo

### Accesso Sistema
1. Apri applicazione nel browser
2. Inserisci credenziali: admin/admin
3. Clicca "Accedi" per accedere alla dashboard

### Gestione Prenotazioni
1. **Nuova Prenotazione**:
   - Clicca "+" o "Nuova Prenotazione"
   - Compila form con dati cliente e trattamento
   - Seleziona data e orario disponibile
   - Conferma per salvare

2. **Modifica Prenotazione**:
   - Clicca icona modifica (matita) sull'appuntamento
   - Aggiorna dati necessari
   - Salva modifiche

3. **Cancella Prenotazione**:
   - Clicca icona cestino
   - Conferma cancellazione

### Navigazione Viste
- **Selettore Vista**: Usa pulsanti Giorno/Settimana/Mese
- **Navigazione Temporale**: Frecce per muoversi tra periodi
- **Oggi**: Pulsante per ritorno rapido alla data corrente

## 🔧 Script Disponibili

- `npm run dev` - Ambiente sviluppo con hot reload
- `npm run build` - Build ottimizzata per produzione
- `npm run preview` - Anteprima build locale
- `npm run lint` - Verifica codice con ESLint

## 🌟 Funzionalità Tecniche Avanzate

### Validazione Dati
- **Email**: Controllo formato RFC compliant
- **Date**: Prevenzione prenotazioni passate
- **Orari**: Validazione vs orari lavorativi
- **Sovrapposizioni**: Controllo automatico conflitti

### Gestione Stato
- **Stato locale**: React useState per dati sessione
- **Aggiornamenti real-time**: Riflesso immediato modifiche
- **Persistenza sessione**: Dati mantenuti durante navigazione

### Accessibilità
- **Keyboard navigation**: Navigazione completa da tastiera
- **Screen reader**: Supporto lettori schermo
- **Focus management**: Gestione focus per UX ottimale
- **Color contrast**: Contrasti conformi WCAG

### Performance
- **Code splitting**: Caricamento componenti ottimizzato
- **Memoization**: Ottimizzazione re-render React
- **Bundle optimization**: Build ottimizzata con Vite

## 📄 Licenza

Progetto sviluppato per scopi educativi e dimostrativi nell'ambito del corso Master Web Developer.

## 🤝 Contributi

Per contribuire al progetto:
1. Fork del repository
2. Crea feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit modifiche (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Crea Pull Request

---

**Armonia Wellness** - Trasforma la gestione delle prenotazioni del tuo centro benessere in un'esperienza digitale moderna, efficiente e user-friendly.