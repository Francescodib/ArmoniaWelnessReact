# Form di Prenotazione - Selezione Slot Orari

## Panoramica

Il form di prenotazione è stato aggiornato per utilizzare un sistema di selezione slot orari intelligente invece dell'input time tradizionale. Questo sistema offre una migliore esperienza utente e previene errori di prenotazione.

## Caratteristiche Principali

### 🕒 Selezione Slot Intelligente
- **Select con slot disponibili**: Mostra solo gli slot orari disponibili per la data e trattamento selezionati
- **Slot occupati disabilitati**: Gli slot non disponibili sono visibili ma disabilitati
- **Validazione automatica**: Previene la selezione di slot non validi
- **Aggiornamento dinamico**: Gli slot si aggiornano automaticamente quando cambiano data o trattamento

### 📊 Informazioni Dettagliate
- **Numero slot disponibili**: Mostra quanti slot sono liberi
- **Percentuale disponibilità**: Barra di progresso visiva
- **Primo e ultimo slot**: Informazioni sui limiti temporali
- **Slot occupati**: Conteggio degli slot non disponibili

### 🔄 Logica di Aggiornamento
- **Reset automatico**: L'orario si resetta quando cambiano data o trattamento
- **Filtro intelligente**: Considera durata trattamento e sovrapposizioni
- **Orari lavorativi**: Rispetta la configurazione del centro

## Funzionamento

### 1. Generazione Slot
```typescript
// Genera tutti gli slot per la data selezionata
const allTimeSlots = generateTimeSlots(new Date(formData.date));

// Filtra solo quelli disponibili
const availableTimeSlots = allTimeSlots.filter(slot => {
  // Verifica orario lavorativo
  if (!isWorkingHour(slot, date)) return false;
  
  // Verifica che non finisca dopo l'orario lavorativo
  const endTime = calculateEndTime(slot, treatmentDuration);
  if (isAfterWorkingHours(endTime, date)) return false;
  
  // Verifica sovrapposizioni
  if (hasConflicts(slot, treatmentDuration, existingAppointments)) return false;
  
  return true;
});
```

### 2. Selezione Slot
```typescript
<select value={formData.startTime} onChange={handleTimeChange}>
  <option value="">Seleziona orario</option>
  {allTimeSlots.map(slot => {
    const isAvailable = availableTimeSlots.includes(slot);
    const isWorking = isWorkingHour(slot, date);
    
    return (
      <option 
        key={slot} 
        value={slot}
        disabled={!isAvailable}
      >
        {slot} {!isAvailable ? (isWorking ? '(Occupato)' : '(Fuori orario)') : ''}
      </option>
    );
  })}
</select>
```

### 3. Informazioni Slot
```typescript
<TimeSlotInfo
  availableSlots={availableTimeSlots}
  selectedDate={formData.date}
  selectedTreatment={formData.treatmentId}
  totalSlots={totalSlots}
  showOccupiedInfo={true}
/>
```

## Vantaggi del Nuovo Sistema

### ✅ **Prevenzione Errori**
- Impossibile selezionare slot non disponibili
- Validazione automatica di orari e sovrapposizioni
- Feedback immediato sulla disponibilità

### 🎯 **Migliore UX**
- Selezione intuitiva da lista predefinita
- Informazioni chiare su disponibilità
- Aggiornamento dinamico senza ricaricamento

### 🔧 **Manutenibilità**
- Logica centralizzata per la gestione slot
- Facile aggiungere nuove regole di validazione
- Codice più pulito e testabile

## Configurazione

### Modifica Durata Slot
Per cambiare la durata degli slot orari, modifica `src/config/settings.ts`:

```typescript
export const CENTER_SETTINGS = {
  booking: {
    slotDuration: 15, // Slot di 15 minuti invece di 30
    // ... altre impostazioni
  }
};
```

### Aggiungere Nuove Regole
Per aggiungere nuove regole di validazione, modifica la funzione `getAvailableTimeSlots`:

```typescript
const getAvailableTimeSlots = () => {
  // ... logica esistente
  
  return allSlots.filter(slot => {
    // Regole esistenti
    if (!isWorkingHour(slot, date)) return false;
    if (hasConflicts(slot, treatmentDuration, existingAppointments)) return false;
    
    // Nuove regole personalizzate
    if (isHoliday(date)) return false;
    if (isSpecialClosure(date, slot)) return false;
    if (hasMaintenance(slot, date)) return false;
    
    return true;
  });
};
```

## Stati del Form

### 📅 **Data Non Selezionata**
- Nessuno slot disponibile
- Messaggio: "Seleziona una data per vedere gli slot disponibili"

### 🏥 **Trattamento Non Selezionato**
- Nessuno slot disponibile
- Messaggio: "Seleziona prima un trattamento per vedere gli slot disponibili"

### ✅ **Data e Trattamento Selezionati**
- Slot disponibili mostrati nel select
- Informazioni dettagliate sulla disponibilità
- Barra di progresso visiva

### ⚠️ **Nessuno Slot Disponibile**
- Select disabilitato
- Messaggio di avviso
- Suggerimenti per alternative

## Gestione Errori

### Validazione Form
```typescript
const validateForm = () => {
  const newErrors: Record<string, string> = {};
  
  // ... altre validazioni
  
  if (formData.treatmentId && formData.startTime) {
    // Controllo che l'orario sia tra quelli disponibili
    if (!availableTimeSlots.includes(formData.startTime)) {
      newErrors.startTime = 'L\'orario selezionato non è più disponibile';
    }
  }
  
  return Object.keys(newErrors).length === 0;
};
```

### Messaggi di Errore
- **Slot non disponibile**: "L'orario selezionato non è più disponibile"
- **Validazione fallita**: Messaggi specifici per ogni campo
- **Sovrapposizioni**: Informazioni dettagliate sui conflitti

## Estensibilità

### Aggiungere Nuovi Tipi di Slot
```typescript
interface TimeSlot {
  time: string;
  type: 'available' | 'occupied' | 'maintenance' | 'break';
  reason?: string;
  duration?: number;
}

const getEnhancedTimeSlots = (date: Date): TimeSlot[] => {
  return generateTimeSlots(date).map(slot => ({
    time: slot,
    type: determineSlotType(slot, date),
    reason: getSlotReason(slot, date),
    duration: getSlotDuration(slot, date)
  }));
};
```

### Supporto Multi-Lingua
```typescript
const messages = {
  it: {
    selectTime: 'Seleziona orario',
    noSlotsAvailable: 'Nessuno slot disponibile',
    occupied: 'Occupato',
    outsideHours: 'Fuori orario'
  },
  en: {
    selectTime: 'Select time',
    noSlotsAvailable: 'No slots available',
    occupied: 'Occupied',
    outsideHours: 'Outside hours'
  }
};
```

## Testing

### Test Unitari
```typescript
describe('getAvailableTimeSlots', () => {
  it('should filter out occupied slots', () => {
    const date = new Date('2024-01-15');
    const treatment = { id: '1', duration: 60 };
    const appointments = [/* appuntamenti esistenti */];
    
    const available = getAvailableTimeSlots(date, treatment, appointments);
    expect(available).not.toContain('10:00'); // slot occupato
    expect(available).toContain('11:00'); // slot libero
  });
});
```

### Test di Integrazione
```typescript
describe('AppointmentForm', () => {
  it('should update available slots when date changes', () => {
    render(<AppointmentForm {...props} />);
    
    const dateInput = screen.getByLabelText('Data');
    fireEvent.change(dateInput, { target: { value: '2024-01-16' } });
    
    const timeSelect = screen.getByLabelText('Orario');
    expect(timeSelect).toHaveDisplayValue('Seleziona orario');
  });
});
```

## Troubleshooting

### Problemi Comuni

1. **"Nessuno slot disponibile"**
   - Verifica che la data sia lavorativa
   - Controlla la durata del trattamento
   - Verifica sovrapposizioni con appuntamenti esistenti

2. **Slot non si aggiornano**
   - Controlla le dipendenze degli useEffect
   - Verifica che la funzione `getAvailableTimeSlots` sia chiamata correttamente
   - Controlla la logica di filtro

3. **Validazione fallisce**
   - Verifica che l'orario sia tra quelli disponibili
   - Controlla i messaggi di errore
   - Verifica la logica di validazione

### Debug
```typescript
// Aggiungi log per debug
console.log('Date:', formData.date);
console.log('Treatment:', formData.treatmentId);
console.log('All slots:', allTimeSlots);
console.log('Available slots:', availableTimeSlots);
console.log('Selected time:', formData.startTime);
```

## Conclusioni

Il nuovo sistema di selezione slot orari offre:
- **Migliore esperienza utente** con selezione guidata
- **Prevenzione errori** con validazione automatica
- **Informazioni chiare** sulla disponibilità
- **Flessibilità** per future estensioni
- **Manutenibilità** del codice

Questo approccio rende il processo di prenotazione più intuitivo e riduce significativamente gli errori di input.
