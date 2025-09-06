import type { WorkingHours } from '../types/index';
import { CENTER_SETTINGS } from './settings';

export const defaultWorkingHours: WorkingHours = CENTER_SETTINGS.defaultWorkingHours;

// Helper per ottenere gli orari di un giorno specifico
export const getWorkingHoursForDay = (date: Date): { start: string; end: string; afternoonStart: string; afternoonEnd: string } => {
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[date.getDay()];
  return defaultWorkingHours[dayName as keyof WorkingHours];
};

// Helper per verificare se un giorno è lavorativo
export const isWorkingDay = (date: Date): boolean => {
  const day = date.getDay();
  return day >= 1 && day <= 6; // Lunedì = 1, Sabato = 6
};

// Helper per verificare se un orario è lavorativo
export const isWorkingHour = (time: string, date: Date): boolean => {
  const workingHours = getWorkingHoursForDay(date);
  const [hour, minute] = time.split(':').map(Number);
  const timeMinutes = hour * 60 + minute;
  
  // Verifica mattina
  const [startHour, startMinute] = workingHours.start.split(':').map(Number);
  const startMinutes = startHour * 60 + startMinute;
  
  // Verifica fine mattina
  const [endHour, endMinute] = workingHours.end.split(':').map(Number);
  const endMinutes = endHour * 60 + endMinute;
  
  // Verifica inizio pomeriggio
  const [afternoonStartHour, afternoonStartMinute] = workingHours.afternoonStart.split(':').map(Number);
  const afternoonStartMinutes = afternoonStartHour * 60 + afternoonStartMinute;
  
  // Verifica fine pomeriggio
  const [afternoonEndHour, afternoonEndMinute] = workingHours.afternoonEnd.split(':').map(Number);
  const afternoonEndMinutes = afternoonEndHour * 60 + afternoonEndMinute;
  
  // Se sabato, solo mattina
  if (date.getDay() === 6) {
    return timeMinutes >= startMinutes && timeMinutes < endMinutes;
  }
  
  // Se domenica, sempre chiuso
  if (date.getDay() === 0) {
    return false;
  }
  
  // Giorni feriali: mattina o pomeriggio
  // Permette di iniziare un appuntamento se finisce entro l'orario di chiusura
  return (timeMinutes >= startMinutes && timeMinutes < endMinutes) || 
         (timeMinutes >= afternoonStartMinutes && timeMinutes < afternoonEndMinutes);
};

// Helper per generare gli slot orari di un giorno
export const generateTimeSlots = (date: Date): string[] => {
  const workingHours = getWorkingHoursForDay(date);
  const timeSlots: string[] = [];
  
  // Se domenica, nessuno slot
  if (date.getDay() === 0) return timeSlots;
  
  // Genera slot mattina
  const [startHour, startMinute] = workingHours.start.split(':').map(Number);
  const [endHour] = workingHours.end.split(':').map(Number);
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += CENTER_SETTINGS.booking.slotDuration) {
      if (hour === startHour && minute < startMinute) continue;
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeSlots.push(time);
    }
  }
  
  // Se sabato, solo mattina
  if (date.getDay() === 6) return timeSlots;
  
  // Genera slot pomeriggio
  const [afternoonStartHour, afternoonStartMinute] = workingHours.afternoonStart.split(':').map(Number);
  const [afternoonEndHour] = workingHours.afternoonEnd.split(':').map(Number);
  
  for (let hour = afternoonStartHour; hour < afternoonEndHour; hour++) {
    for (let minute = 0; minute < 60; minute += CENTER_SETTINGS.booking.slotDuration) {
      if (hour === afternoonStartHour && minute < afternoonStartMinute) continue;
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeSlots.push(time);
    }
  }
  
  return timeSlots;
};

// Helper per verificare se un orario è pausa pranzo
export const isLunchBreak = (time: string, date: Date): boolean => {
  const [hour, minute] = time.split(':').map(Number);
  const timeMinutes = hour * 60 + minute;
  
  // Pausa pranzo solo nei giorni feriali
  if (date.getDay() === 0 || date.getDay() === 6) return false;
  
  // Pausa pranzo: 13:00 - 14:00
  const lunchStart = 13 * 60; // 13:00
  const lunchEnd = 14 * 60;   // 14:00
  
  return timeMinutes >= lunchStart && timeMinutes < lunchEnd;
};

// Helper per verificare se uno slot è disponibile per una durata specifica
export const isTimeSlotAvailableForDuration = (time: string, date: Date, duration: number): boolean => {
  if (!isWorkingDay(date) || !isWorkingHour(time, date)) return false;
  
  // Verifica che non finisca dopo l'orario lavorativo
  if (!isWithinWorkingHours(time, duration, date)) return false;
  
  // Verifica che non si sovrapponga alla pausa pranzo
  if (conflictsWithLunchBreak(time, duration, date)) return false;
  
  return true;
};

// Helper per verificare se un trattamento è entro gli orari lavorativi
export const isWithinWorkingHours = (startTime: string, duration: number, date: Date): boolean => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = startMinutes + duration;
  
  const workingHours = getWorkingHoursForDay(date);
  const [endHourLimit, endMinuteLimit] = workingHours.afternoonEnd.split(':').map(Number);
  const endLimitMinutes = endHourLimit * 60 + endMinuteLimit;
  
  // Non permettere di finire dopo l'orario di chiusura
  return endMinutes <= endLimitMinutes;
};

// Helper per verificare se un trattamento si sovrappone alla pausa pranzo
export const conflictsWithLunchBreak = (startTime: string, duration: number, date: Date): boolean => {
  if (date.getDay() === 0 || date.getDay() === 6) return false; // Weekend
  
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = startMinutes + duration;
  
  // Pausa pranzo: 13:00 - 14:00
  const lunchStart = 13 * 60; // 13:00
  const lunchEnd = 14 * 60;   // 14:00
  
  // Conflitto se il trattamento si sovrappone alla pausa pranzo
  return startMinutes < lunchEnd && endMinutes > lunchStart;
};

// Helper per verificare conflitti tra appuntamenti
export const hasAppointmentConflict = (
  startTime: string, 
  duration: number, 
  existingAppointments: { id: string; startTime: string; treatmentId: string; date: string }[], 
  treatments: { id: string; duration: number }[],
  excludeAppointmentId?: string
): boolean => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = startMinutes + duration;
  
  return existingAppointments.some(apt => {
    if (excludeAppointmentId && apt.id === excludeAppointmentId) return false;
    
    const aptStart = apt.startTime.split(':').map(Number);
    const aptStartMinutes = aptStart[0] * 60 + aptStart[1];
    const treatment = treatments.find(t => t.id === apt.treatmentId);
    const aptEndMinutes = aptStartMinutes + (treatment?.duration || 0);
    
    // Sovrapposizione: inizio nuovo < fine esistente E fine nuovo > inizio esistente
    return startMinutes < aptEndMinutes && endMinutes > aptStartMinutes;
  });
};

// Helper per ottenere la descrizione dell'orario lavorativo
export const getWorkingHoursDescription = (date: Date): string => {
  const workingHours = getWorkingHoursForDay(date);
  
  if (date.getDay() === 0) return 'Centro chiuso';
  if (date.getDay() === 6) return `Orario: ${workingHours.start} - ${workingHours.end}`;
  
  return `Orario: ${workingHours.start} - ${workingHours.end}, ${workingHours.afternoonStart} - ${workingHours.afternoonEnd}`;
};

// Helper per verificare se una data è nel passato
export const isDateInPast = (dateString: string): boolean => {
  const today = new Date();
  const appointmentDate = new Date(dateString);
  
  // Imposta l'ora a 00:00:00 per confrontare solo le date
  today.setHours(0, 0, 0, 0);
  appointmentDate.setHours(0, 0, 0, 0);
  
  return appointmentDate < today;
};

// Helper per verificare se un orario è nel passato per la data corrente
export const isTimeInPast = (time: string, dateString: string): boolean => {
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const appointmentDate = new Date(dateString);
  appointmentDate.setHours(0, 0, 0, 0);
  
  // Se la data dell'appuntamento è diversa da oggi, non è nel passato
  if (appointmentDate.getTime() !== today.getTime()) {
    return false;
  }
  
  // Se è oggi, controlla se l'orario è nel passato
  const [hour, minute] = time.split(':').map(Number);
  const appointmentDateTime = new Date();
  appointmentDateTime.setHours(hour, minute, 0, 0);
  
  return appointmentDateTime < now;
};

// Helper per verificare se un orario è prenotabile (non nel passato)
export const isTimeBookable = (time: string, dateString: string): boolean => {
  // Se la data è nel passato, non è prenotabile
  if (isDateInPast(dateString)) {
    return false;
  }
  
  // Se è oggi, verifica che l'orario non sia nel passato
  if (isTimeInPast(time, dateString)) {
    return false;
  }
  
  return true;
};

// Helper per filtrare appuntamenti che sono in orari chiusi
export const filterAppointmentsInWorkingHours = <T extends { date: string; startTime: string }>(
  appointments: T[]
): T[] => {
  return appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    
    // Se il giorno non è lavorativo, escludi l'appuntamento
    if (!isWorkingDay(appointmentDate)) {
      return false;
    }
    
    // Se l'orario non è lavorativo, escludi l'appuntamento
    if (!isWorkingHour(appointment.startTime, appointmentDate)) {
      return false;
    }
    
    return true;
  });
};