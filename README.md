# Armonia Wellness - Sistema di Gestione Prenotazioni

Un'applicazione web moderna e intuitiva per la gestione delle prenotazioni di un centro benessere, sviluppata con React, TypeScript e Tailwind CSS.

## 🚀 Caratteristiche Principali

### 🔐 Sistema di Autenticazione
- Login simulato con credenziali admin/admin
- Interfaccia protetta per lo staff del centro
- Logout sicuro

### 📅 Gestione Prenotazioni
- **Vista Giornaliera**: Visualizzazione dettagliata degli appuntamenti per giorno
- **Vista Settimanale**: Panoramica settimanale con griglia oraria
- **Vista Mensile**: Calendario mensile con indicatori visivi

### ✨ Funzionalità CRUD Complete
- ✅ **Creazione**: Nuove prenotazioni con validazione dati
- 📝 **Lettura**: Visualizzazione in tempo reale di tutte le prenotazioni
- 🔄 **Aggiornamento**: Modifica appuntamenti esistenti
- 🗑️ **Cancellazione**: Rimozione prenotazioni con conferma

### 🕒 Gestione Orari Intelligente
- Orari di lavoro: 9:00-13:00 e 14:00-18:00
- Lunedì-Venerdì: Orario completo
- Sabato: Solo mattina (9:00-13:00)
- Domenica: Centro chiuso
- Pausa pranzo automatica dalle 13:00 alle 14:00

### 🚫 Prevenzione Sovrapposizioni
- Controllo automatico della disponibilità
- Validazione della durata dei trattamenti
- Prevenzione di appuntamenti sovrapposti
- Gestione intelligente degli slot temporali

### 📱 Design Responsive
- Interfaccia ottimizzata per dispositivi mobili
- Layout adattivo per tablet e desktop
- Navigazione touch-friendly

## 🛠️ Tecnologie Utilizzate

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4
- **Icone**: Lucide React
- **Build Tool**: Vite
- **Linting**: ESLint

## 📦 Installazione

1. **Clona il repository**
   ```bash
   git clone <repository-url>
   cd ArmoniaWellness
   ```

2. **Installa le dipendenze**
   ```bash
   npm install
   ```

3. **Avvia l'ambiente di sviluppo**
   ```bash
   npm run dev
   ```

4. **Apri nel browser**
   Naviga su `http://localhost:5173`

## 🔑 Accesso

- **Username**: `admin`
- **Password**: `admin`

## 📋 Struttura del Progetto

```
src/
├── components/          # Componenti React
│   ├── Logo.tsx        # Logo personalizzabile
│   ├── Login.tsx       # Form di autenticazione
│   ├── Navbar.tsx      # Barra di navigazione
│   ├── Dashboard.tsx   # Dashboard principale
│   ├── ViewSelector.tsx # Selettore vista (giorno/settimana/mese)
│   ├── DateNavigator.tsx # Navigazione temporale
│   ├── AppointmentForm.tsx # Form prenotazioni
│   ├── DayView.tsx     # Vista giornaliera
│   ├── WeekView.tsx    # Vista settimanale
│   └── MonthView.tsx   # Vista mensile
├── types/              # Definizioni TypeScript
│   └── index.ts        # Interfacce e tipi
├── App.tsx             # Componente principale
├── App.css             # Stili personalizzati
└── index.css           # Stili globali e Tailwind
```

## 🎨 Personalizzazione

### Colori
L'applicazione utilizza una palette di colori personalizzata:
- **Indigo**: Colore primario per bottoni e elementi principali
- **Fuchsia**: Colore secondario per accenti
- **Purple**: Colore per elementi terziari

### Logo
Il componente `Logo` accetta props per personalizzazione:
- `variant`: 'color' | 'white'
- `size`: 'sm' | 'md' | 'lg' | 'xl'

## 📱 Utilizzo

### 1. Accesso
- Inserisci le credenziali admin/admin
- Clicca su "Accedi"

### 2. Navigazione
- **Vista Giorno**: Visualizza gli appuntamenti di un singolo giorno
- **Vista Settimana**: Panoramica settimanale con griglia oraria
- **Vista Mese**: Calendario mensile con indicatori

### 3. Gestione Prenotazioni
- **Nuova**: Clicca su "+" o "Nuova Prenotazione"
- **Modifica**: Clicca sull'icona di modifica
- **Elimina**: Clicca sull'icona del cestino

### 4. Navigazione Temporale
- Usa le frecce per spostarti tra giorni/settimane/mesi
- Clicca su "Oggi" per tornare alla data corrente

## 🔧 Sviluppo

### Script Disponibili
- `npm run dev`: Avvia l'ambiente di sviluppo
- `npm run build`: Compila per la produzione
- `npm run preview`: Anteprima della build
- `npm run lint`: Controllo del codice

### Aggiungere Nuovi Trattamenti
Modifica l'array `sampleTreatments` in `Dashboard.tsx`:

```typescript
const sampleTreatments: Treatment[] = [
  {
    id: '6',
    name: 'Nuovo Trattamento',
    duration: 75, // in minuti
    price: 95,
    category: 'massage'
  }
];
```

## 🌟 Funzionalità Avanzate

### Validazione Dati
- Controllo formato email
- Validazione campi obbligatori
- Prevenzione sovrapposizioni orarie

### Gestione Stato
- Stato locale React per prenotazioni
- Aggiornamento in tempo reale
- Persistenza durante la sessione

### Responsive Design
- Breakpoint mobile-first
- Layout adattivo per tutti i dispositivi
- Navigazione ottimizzata per touch

## 📄 Licenza

Questo progetto è sviluppato per scopi educativi e dimostrativi.

## 🤝 Contributi

Per contribuire al progetto:
1. Fork del repository
2. Crea un branch per la feature
3. Commit delle modifiche
4. Push al branch
5. Crea una Pull Request

---

**Armonia Wellness** - Trasforma la gestione delle prenotazioni in un'esperienza digitale elegante e efficiente.
