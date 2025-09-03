// Configurazione generale del centro benessere
export const CENTER_SETTINGS = {
  name: 'Armonia Wellness',
  address: 'Via del Benessere, 123',
  phone: '+39 123 456 7890',
  email: 'info@armoniawellness.it',
  
  // Orari di apertura predefiniti
  defaultWorkingHours: {
    monday: { start: '09:00', end: '13:00', afternoonStart: '14:00', afternoonEnd: '18:00' },
    tuesday: { start: '09:00', end: '13:00', afternoonStart: '14:00', afternoonEnd: '18:00' },
    wednesday: { start: '09:00', end: '13:00', afternoonStart: '14:00', afternoonEnd: '18:00' },
    thursday: { start: '09:00', end: '13:00', afternoonStart: '14:00', afternoonEnd: '18:00' },
    friday: { start: '09:00', end: '13:00', afternoonStart: '14:00', afternoonEnd: '18:00' },
    saturday: { start: '09:00', end: '13:00', afternoonStart: '14:00', afternoonEnd: '13:00' }, // Solo mattina
    sunday: { start: '00:00', end: '00:00', afternoonStart: '00:00', afternoonEnd: '00:00' } // Chiuso
  },
  
  // Impostazioni prenotazioni
  booking: {
    slotDuration: 30, // Durata slot in minuti
    maxAdvanceBooking: 90, // Giorni in anticipo per prenotare
    minAdvanceBooking: 0, // Giorni minimi in anticipo
    cancellationPolicy: '24 ore prima dell\'appuntamento',
    reminderHours: 24 // Ore prima dell'appuntamento per il promemoria
  },
  
  // Impostazioni trattamenti
  treatments: {
    defaultDuration: 60, // Durata predefinita in minuti
    categories: ['massage', 'facial', 'body', 'wellness'] as const
  },
  
  // Impostazioni UI
  ui: {
    timeFormat: '24h', // Formato orario
    dateFormat: 'DD/MM/YYYY', // Formato data
    language: 'it', // Lingua predefinita
    theme: 'light' // Tema predefinito
  }
};

// Configurazione per ambienti diversi
export const ENV_CONFIG = {
  development: {
    apiUrl: 'http://localhost:3001/api',
    debug: true,
    mockData: true
  },
  production: {
    apiUrl: 'https://api.armoniawellness.it',
    debug: false,
    mockData: false
  }
};

// Funzione per ottenere la configurazione in base all'ambiente
export const getConfig = () => {
  const env = import.meta.env.MODE || 'development';
  return {
    ...CENTER_SETTINGS,
    env: ENV_CONFIG[env as keyof typeof ENV_CONFIG] || ENV_CONFIG.development
  };
};
