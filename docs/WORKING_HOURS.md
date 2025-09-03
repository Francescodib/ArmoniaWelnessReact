# Sistema di Gestione Orari Lavorativi

## Panoramica

Il sistema di gestione orari lavorativi è stato completamente ristrutturato per essere più flessibile, configurabile e manutenibile. Ora utilizza l'interfaccia `WorkingHours` già definita nei tipi e centralizza tutta la logica in file di configurazione dedicati.

## Struttura dei File

### 1. `src/config/settings.ts`
File di configurazione principale che contiene tutte le impostazioni del centro benessere:
- Informazioni del centro
- Orari di apertura predefiniti
- Impostazioni prenotazioni
- Configurazione trattamenti
- Impostazioni UI
- Configurazione per ambienti diversi

### 2. `src/config/workingHours.ts`
File dedicato alla gestione degli orari lavorativi con helper functions:
- `defaultWorkingHours`: Orari predefiniti importati da settings
- `getWorkingHoursForDay()`: Ottiene gli orari per un giorno specifico
- `isWorkingDay()`: Verifica se un giorno è lavorativo
- `isWorkingHour()`: Verifica se un orario è lavorativo
- `generateTimeSlots()`: Genera gli slot orari per un giorno
- `isLunchBreak()`: Verifica se un orario è pausa pranzo
- `getWorkingHoursDescription()`: Ottiene la descrizione degli orari

### 3. `src/hooks/useWorkingHours.ts`
Hook personalizzato React per gestire gli orari in modo elegante:
- Memoizzazione delle funzioni per performance
- Utility per validazione appuntamenti
- Interfaccia pulita per i componenti

## Configurazione Orari

### Modifica Orari di Apertura

Per modificare gli orari di apertura, edita `src/config/settings.ts`:

```typescript
export const CENTER_SETTINGS = {
  // ... altre impostazioni
  defaultWorkingHours: {
    monday: { start: '08:00', end: '12:00', afternoonStart: '13:00', afternoonEnd: '19:00' },
    tuesday: { start: '08:00', end: '12:00', afternoonStart: '13:00', afternoonEnd: '19:00' },
    // ... altri giorni
  }
};
```

### Modifica Durata Slot

Per cambiare la durata degli slot orari:

```typescript
export const CENTER_SETTINGS = {
  // ... altre impostazioni
  booking: {
    slotDuration: 15, // Slot di 15 minuti invece di 30
    // ... altre impostazioni
  }
};
```

## Utilizzo nei Componenti

### Utilizzo Base

```typescript
import { 
  isWorkingDay, 
  isWorkingHour, 
  generateTimeSlots 
} from '../config/workingHours';

// Verifica se un giorno è lavorativo
const isWorking = isWorkingDay(new Date('2024-01-15'));

// Verifica se un orario è lavorativo
const isValidTime = isWorkingHour('14:30', new Date('2024-01-15'));

// Genera slot orari per un giorno
const slots = generateTimeSlots(new Date('2024-01-15'));
```

### Utilizzo con Hook

```typescript
import { useWorkingHours } from '../hooks/useWorkingHours';

const MyComponent = ({ date }) => {
  const { 
    isWorking, 
    timeSlots, 
    description, 
    checkWorkingHour,
    isValidAppointmentTime 
  } = useWorkingHours(date);

  // Utilizzo delle funzioni
  if (!isWorking) return <div>Centro chiuso</div>;
  
  return (
    <div>
      <p>{description}</p>
      {timeSlots.map(time => (
        <div key={time}>
          {time} - {checkWorkingHour(time) ? 'Disponibile' : 'Non disponibile'}
        </div>
      ))}
    </div>
  );
};
```

## Regole Attuali

### Giorni Lavorativi
- **Lunedì-Venerdì**: Orario completo (9:00-13:00, 14:00-18:00)
- **Sabato**: Solo mattina (9:00-13:00)
- **Domenica**: Centro chiuso

### Orari Lavorativi
- **Mattina**: 9:00 - 13:00
- **Pausa pranzo**: 13:00 - 14:00 (bloccata)
- **Pomeriggio**: 14:00 - 18:00
- **Slot**: 30 minuti (configurabile)

### Validazioni
- Controllo automatico orari lavorativi
- Prevenzione sovrapposizioni
- Verifica durata trattamenti
- Gestione pausa pranzo

## Estensibilità

### Aggiungere Nuovi Giorni

Per supportare orari diversi per giorni specifici, modifica la logica in `workingHours.ts`:

```typescript
export const isWorkingHour = (time: string, date: Date): boolean => {
  // Logica personalizzata per giorni specifici
  if (isHoliday(date)) return false;
  if (isSpecialDay(date)) return getSpecialDayHours(date, time);
  
  // Logica standard
  // ...
};
```

### Aggiungere Eccezioni

Per gestire eccezioni (festività, chiusure straordinarie):

```typescript
export const isWorkingDay = (date: Date): boolean => {
  // Controlla eccezioni
  if (isHoliday(date)) return false;
  if (isSpecialClosure(date)) return false;
  
  // Logica standard
  const day = date.getDay();
  return day >= 1 && day <= 6;
};
```

## Migrazione

### Da Sistema Precedente

Il sistema precedente utilizzava valori hardcoded nei componenti. Per migrare:

1. **Rimuovi** le funzioni duplicate dai componenti
2. **Importa** le funzioni dalla configurazione
3. **Aggiorna** le chiamate per passare oggetti `Date` invece di stringhe
4. **Utilizza** il hook `useWorkingHours` per componenti complessi

### Esempio di Migrazione

**Prima:**
```typescript
const isWorkingDay = (dateStr: string) => {
  const date = new Date(dateStr);
  const day = date.getDay();
  return day >= 1 && day <= 6;
};
```

**Dopo:**
```typescript
import { isWorkingDay } from '../config/workingHours';

// Utilizzo
const isWorking = isWorkingDay(new Date(dateStr));
```

## Vantaggi del Nuovo Sistema

1. **Centralizzazione**: Tutta la logica in un posto
2. **Configurabilità**: Facile modifica orari e impostazioni
3. **Riusabilità**: Funzioni utilizzabili ovunque
4. **Manutenibilità**: Codice più pulito e organizzato
5. **Performance**: Hook con memoizzazione
6. **Estensibilità**: Facile aggiungere nuove funzionalità
7. **Testing**: Funzioni pure più facili da testare
8. **Type Safety**: Utilizzo completo dell'interfaccia TypeScript

## Troubleshooting

### Errori Comuni

1. **"Cannot find name 'getWorkingHoursForDay'"**
   - Verifica che la funzione sia importata correttamente
   - Controlla che il file `workingHours.ts` esista

2. **"Argument of type 'string' is not assignable to parameter of type 'Date'"**
   - Converti le stringhe in oggetti `Date` prima di passarli alle funzioni
   - Esempio: `new Date(dateString)`

3. **"Function is defined but never used"**
   - Rimuovi le importazioni non utilizzate
   - Verifica che le funzioni siano chiamate correttamente

### Debug

Per debuggare gli orari:

```typescript
import { getWorkingHoursForDay } from '../config/workingHours';

const date = new Date('2024-01-15');
const hours = getWorkingHoursForDay(date);
console.log('Orari per', date.toDateString(), ':', hours);
```
