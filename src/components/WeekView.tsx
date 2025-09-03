import React from 'react';
import { Plus, Edit, Trash2, Clock } from 'lucide-react';
import type { Appointment, Treatment } from '../types/index';
import StatusBadge from './StatusBadge';
import { formatDateToISOString } from '../utils/utils';
import { 
  isWorkingDay, 
  isWorkingHour, 
  generateTimeSlots, 
  getWorkingHoursDescription 
} from '../config/workingHours';

interface WeekViewProps {
  startDate: Date;
  appointments: Appointment[];
  treatments: Treatment[];
  onAddAppointment: (date: string, time: string, maxDuration?: number) => void;
  onEditAppointment: (appointment: Appointment) => void;
  onDeleteAppointment: (id: string) => void;
}

const WeekView: React.FC<WeekViewProps> = ({
  startDate,
  appointments,
  treatments,
  onAddAppointment,
  onEditAppointment,
  onDeleteAppointment
}) => {
  // Helper function per ottenere il trattamento da treatmentId
  const getTreatmentById = (treatmentId: string): Treatment | undefined => {
    return treatments.find(t => t.id === treatmentId);
  };

  // Genera slot orari basati sulla configurazione (usa il primo giorno della settimana come riferimento)
  const timeSlots = generateTimeSlots(startDate);

  const getWeekDays = (start: Date) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays(startDate);

  // Le funzioni isWorkingDay e isWorkingHour sono ora importate dalla configurazione

  const getAppointmentsForDayAndTime = (date: string, time: string) => {
    return appointments.filter(apt => apt.date === date && apt.startTime === time);
  };

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':').map(Number);
    return `${hour}:${minute.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const getAppointmentEndTime = (appointment: Appointment) => {
    const [startHour, startMinute] = appointment.startTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const treatment = getTreatmentById(appointment.treatmentId);
    const endMinutes = startMinutes + (treatment?.duration || 0);
    const endHour = Math.floor(endMinutes / 60);
    const endMinute = endMinutes % 60;
    return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
  };

  const isTimeSlotOccupied = (date: string, time: string) => {
    return appointments.some(apt => {
      if (apt.date !== date) return false;
      const aptStart = apt.startTime;
      const aptEnd = getAppointmentEndTime(apt);
      return time >= aptStart && time < aptEnd;
    });
  };

  const canAddAppointment = (date: string, time: string) => {
    const dateObj = new Date(date);
    if (!isWorkingDay(dateObj) || !isWorkingHour(time, dateObj)) return false;
    if (isTimeSlotOccupied(date, time)) return false;
    
    // Verifica che non ci siano sovrapposizioni
    const [hour, minute] = time.split(':').map(Number);
    const timeMinutes = hour * 60 + minute;
    
    return !appointments.some(apt => {
      if (apt.date !== date) return false;
      const aptStart = apt.startTime.split(':').map(Number);
      const aptStartMinutes = aptStart[0] * 60 + aptStart[1];
      const treatment = getTreatmentById(apt.treatmentId);
      const aptEndMinutes = aptStartMinutes + (treatment?.duration || 0);
      return timeMinutes >= aptStartMinutes && timeMinutes < aptEndMinutes;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Settimana dal {startDate.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })} al {(new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000)).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
        </h3>
        <div className="text-sm text-gray-500">
          {getWorkingHoursDescription(startDate)}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Header con i giorni */}
        <div className="grid grid-cols-8 border-b border-gray-200">
          <div className="p-3 bg-gray-50 font-medium text-gray-700 text-sm">
            Orario
          </div>
          {weekDays.map((day) => (
            <div
              key={day.toISOString()}
              className={`p-3 text-center border-l border-gray-200 ${
                isWorkingDay(day) ? 'bg-white' : 'bg-gray-100'
              }`}
            >
              <div className="font-medium text-gray-900">
                {formatDate(day)}
              </div>
              {!isWorkingDay(day) && (
                <div className="text-xs text-gray-500 mt-1">Chiuso</div>
              )}
            </div>
          ))}
        </div>

        {/* Righe degli orari */}
        <div className="grid grid-cols-8 divide-y divide-gray-200">
          {timeSlots.map((time) => {
            const isLunchBreak = time === '13:00';
            
            return (
              <React.Fragment key={time}>
                {/* Colonna orario */}
                <div className="p-3 bg-gray-50 text-sm font-medium text-gray-700 border-r border-gray-200">
                  {formatTime(time)}
                </div>

                {/* Colonne dei giorni */}
                {weekDays.map((day) => {
                  const dateStr = formatDateToISOString(day);
                  const dayAppointments = getAppointmentsForDayAndTime(dateStr, time);
                  const isOccupied = isTimeSlotOccupied(dateStr, time);
                  const canAdd = canAddAppointment(dateStr, time);
                  const isWorking = isWorkingDay(day);

                  if (isLunchBreak) {
                    return (
                      <div key={day.toISOString()} className="p-3 bg-gray-50 text-center text-gray-500 text-sm border-l border-gray-200">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Pausa
                      </div>
                    );
                  }

                  if (!isWorking) {
                    return (
                      <div key={day.toISOString()} className="p-3 bg-gray-100 text-center text-gray-400 text-sm border-l border-gray-200">
                        Chiuso
                      </div>
                    );
                  }

                  return (
                    <div
                      key={day.toISOString()}
                      className={`p-3 border-l border-gray-200 min-h-[80px] ${
                        isOccupied ? 'bg-indigo-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      {dayAppointments.length > 0 ? (
                        dayAppointments.map((appointment) => (
                          <div key={appointment.id} className="mb-2 last:mb-0">
                            <div className="bg-indigo-100 rounded-lg p-2 border border-indigo-200">
                              <div className="font-medium text-indigo-900 text-sm">
                                {appointment.clientName}
                              </div>
                                                              <div className="text-xs text-indigo-700">
                                  {getTreatmentById(appointment.treatmentId)?.name}
                                </div>
                                <StatusBadge status={appointment.status} size="sm" showIcon={false} />
                              <div className="flex gap-1 mt-1">
                                <button
                                  onClick={() => onEditAppointment(appointment)}
                                  className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-200 rounded text-xs"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => onDeleteAppointment(appointment.id)}
                                  className="p-1 text-red-600 hover:text-red-800 hover:bg-red-200 rounded text-xs"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        canAdd ? (
                          <button
                            onClick={() => onAddAppointment(dateStr, time)}
                            className="w-full h-full flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        ) : (
                          <div className="text-gray-300 text-xs text-center">
                            Occupato
                          </div>
                        )
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeekView;
