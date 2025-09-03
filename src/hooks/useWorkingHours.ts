import { useMemo } from 'react';
import { 
  defaultWorkingHours, 
  getWorkingHoursForDay, 
  isWorkingDay, 
  isWorkingHour, 
  generateTimeSlots, 
  isLunchBreak, 
  getWorkingHoursDescription 
} from '../config/workingHours';

export const useWorkingHours = (date: Date) => {
  const workingHours = useMemo(() => getWorkingHoursForDay(date), [date]);
  const timeSlots = useMemo(() => generateTimeSlots(date), [date]);
  const isWorking = useMemo(() => isWorkingDay(date), [date]);
  const description = useMemo(() => getWorkingHoursDescription(date), [date]);

  const checkWorkingHour = useMemo(() => (time: string) => isWorkingHour(time, date), [date]);
  const checkLunchBreak = useMemo(() => (time: string) => isLunchBreak(time, date), [date]);

  return {
    workingHours,
    timeSlots,
    isWorking,
    description,
    checkWorkingHour,
    checkLunchBreak,
    // Utility per verificare se un orario è valido per un appuntamento
    isValidAppointmentTime: (time: string, duration: number) => {
      if (!isWorking || !checkWorkingHour(time)) return false;
      
      const [hour, minute] = time.split(':').map(Number);
      const timeMinutes = hour * 60 + minute;
      const endMinutes = timeMinutes + duration;
      
      // Verifica che non finisca dopo l'orario lavorativo
      const [endHourLimit, endMinuteLimit] = workingHours.afternoonEnd.split(':').map(Number);
      const endLimitMinutes = endHourLimit * 60 + endMinuteLimit;
      
      // Permette di prenotare se finisce esattamente all'orario di chiusura o prima
      return endMinutes <= endLimitMinutes;
    }
  };
};
