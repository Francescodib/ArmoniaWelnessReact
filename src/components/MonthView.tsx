import React from 'react';
import { Plus } from 'lucide-react';
import type { Appointment, Treatment } from '../types/index';
import { capitalize, formatDateToISOString } from '../utils/utils';
import StatusBadge from './StatusBadge';
import { isWorkingDay, isWorkingHour, getWorkingHoursDescription, filterAppointmentsInWorkingHours, isDateInPast, isTimeBookable } from '../config/workingHours';

interface MonthViewProps {
  currentDate: Date;
  appointments: Appointment[];
  treatments: Treatment[];
  onAddAppointment: (date: string, time: string, maxDuration?: number) => void;
  onEditAppointment: (appointment: Appointment) => void;
  onMonthChange: (date: Date) => void;
}

const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  appointments,
  treatments,
  onAddAppointment,
  onEditAppointment
}) => {
  // Helper function per ottenere il trattamento da treatmentId
  const getTreatmentById = (treatmentId: string): Treatment | undefined => {
    return treatments.find(t => t.id === treatmentId);
  };

  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay() + 1); // Inizia da lunedì
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (7 - lastDay.getDay())); // Finisce domenica
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const monthDays = getMonthDays(currentDate);

  // La funzione isWorkingDay è ora importata dalla configurazione

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getAppointmentsForDay = (date: string) => {
    const dayAppointments = appointments.filter(apt => apt.date === date);
    // Filtra solo gli appuntamenti che sono in orari lavorativi
    return filterAppointmentsInWorkingHours(dayAppointments);
  };

  const formatDate = (date: Date) => {
    return date.getDate();
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
  };

  // Helper per verificare se un giorno è completamente chiuso
  const isDayCompletelyClosed = (date: Date): boolean => {
    return !isWorkingDay(date);
  };

  // Helper per verificare se un giorno ha orari limitati (es. sabato solo mattina)
  const hasLimitedHours = (date: Date): boolean => {
    if (!isWorkingDay(date)) return false;
    const day = date.getDay();
    return day === 6; // Sabato
  };

  // Helper per ottenere la descrizione dello stato del giorno
  const getDayStatus = (date: Date): { status: 'open' | 'limited' | 'closed', description: string } => {
    if (isDayCompletelyClosed(date)) {
      return { status: 'closed', description: 'Chiuso' };
    }
    
    if (hasLimitedHours(date)) {
      return { status: 'limited', description: 'Solo mattina' };
    }
    
    return { status: 'open', description: 'Aperto' };
  };


  return (
    <div className="space-y-4">
      {/* Header del mese */}
      <div className="flex items-center justify-between hidden lg:block">
        <div className="flex items-center gap-4">
      
            <h3 className="text-lg font-semibold text-gray-900">
              {capitalize(getMonthName(currentDate))}
            </h3>

        </div>
      </div>

      {/* Griglia del calendario */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Header dei giorni della settimana */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((day) => (
            <div key={day} className="p-3 text-center bg-gray-50 font-medium text-gray-700 text-sm">
              {day}
            </div>
          ))}
        </div>

        {/* Griglia dei giorni */}
        <div className="grid grid-cols-7 divide-x divide-y divide-gray-200">
          {monthDays.map((day) => {
            const dateStr = formatDateToISOString(day);
            const dayAppointments = getAppointmentsForDay(dateStr);
            const isCurrentMonthDay = isCurrentMonth(day);
            const isTodayDay = isToday(day);
            const dayStatus = getDayStatus(day);
            const isWorking = isWorkingDay(day);

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[120px] p-2 ${
                  !isCurrentMonthDay ? 'bg-gray-50' : 
                  dayStatus.status === 'closed' ? 'bg-gray-100' :
                  dayStatus.status === 'limited' ? 'bg-amber-50' :
                  'hover:bg-gray-50'
                } ${
                  isTodayDay ? 'ring-2 ring-indigo-500 ring-inset' : ''
                }`}
              >
                {/* Numero del giorno */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-sm font-medium ${
                      isCurrentMonthDay ? 'text-gray-900' : 'text-gray-400'
                    } ${
                      isTodayDay ? 'text-indigo-600 font-bold' : ''
                    } ${
                      dayStatus.status === 'closed' ? 'text-gray-500' : ''
                    }`}
                  >
                    {formatDate(day)}
                  </span>
                  
                  {isWorking && isCurrentMonthDay && dayStatus.status !== 'closed' && isTimeBookable('09:00', dateStr) && (
                    <button
                      onClick={() => onAddAppointment(dateStr, '09:00')}
                      className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-100 rounded text-xs"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Prenotazioni del giorno */}
                <div className="space-y-1">
                  {dayAppointments.slice(0, 3).map((appointment) => (
                    <div
                      key={appointment.id}
                      className="bg-indigo-100 rounded p-2 border border-indigo-200 cursor-pointer hover:bg-indigo-200 transition-colors duration-200"
                      onClick={() => onEditAppointment(appointment)}
                    >
                      <div className="text-xs font-medium text-indigo-900 truncate">
                        {appointment.clientName}
                      </div>
                      <div className="text-xs text-indigo-700">
                        {appointment.startTime} • {getTreatmentById(appointment.treatmentId)?.name}
                      </div>
                      <StatusBadge status={appointment.status} size="sm" showIcon={false} />
                    </div>
                  ))}
                  
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-gray-500 text-center py-1">
                      +{dayAppointments.length - 3} altre
                    </div>
                  )}
                </div>

                {/* Indicatore dello stato del giorno */}
                {dayStatus.status !== 'open' && (
                  <div className={`text-xs text-center mt-2 px-2 py-1 rounded ${
                    dayStatus.status === 'closed' 
                      ? 'text-gray-500 bg-gray-200' 
                      : 'text-amber-700 bg-amber-200'
                  }`}>
                    {dayStatus.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-indigo-100 border border-indigo-200 rounded"></div>
          <span>Prenotazione</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
          <span>Centro chiuso</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-50 border border-amber-200 rounded"></div>
          <span>Orari limitati</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 ring-2 ring-indigo-500 rounded"></div>
          <span>Oggi</span>
        </div>
      </div>
    </div>
  );
};

export default MonthView;
