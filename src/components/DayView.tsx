import React from 'react';
import { Plus, Edit, Trash2, Clock } from 'lucide-react';
import type { Appointment, Treatment } from '../types/index';
import { capitalize } from '../utils/utils';
import StatusBadge from './StatusBadge';
import { 
  isWorkingDay, 
  isWorkingHour, 
  generateTimeSlots, 
  isLunchBreak, 
  getWorkingHoursDescription,
  getWorkingHoursForDay,
  isTimeSlotAvailableForDuration
} from '../config/workingHours';

interface DayViewProps {
  date: string;
  appointments: Appointment[];
  treatments: Treatment[];
  onAddAppointment: (date: string, time: string, maxDuration?: number) => void;
  onEditAppointment: (appointment: Appointment) => void;
  onDeleteAppointment: (id: string) => void;
}

const DayView: React.FC<DayViewProps> = ({
  date,
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

  // Genera slot orari basati sulla configurazione
  const timeSlots = generateTimeSlots(new Date(date));

  const getAppointmentAtTime = (time: string) => {
    return appointments.find(apt => apt.startTime === time);
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

  const isTimeSlotOccupied = (time: string) => {
    return appointments.some(apt => {
      const aptStart = apt.startTime;
      const aptEnd = getAppointmentEndTime(apt);
      return time >= aptStart && time < aptEnd;
    });
  };

  const canAddAppointment = (time: string, treatmentDuration?: number) => {
    if (!isWorkingDay(new Date(date)) || !isWorkingHour(time, new Date(date))) return false;
    if (isTimeSlotOccupied(time)) return false;
    
    // Verifica che non ci siano sovrapposizioni
    const [hour, minute] = time.split(':').map(Number);
    const timeMinutes = hour * 60 + minute;
    
    // Verifica che non finisca dopo l'orario lavorativo
    const duration = treatmentDuration || 60; // Durata del trattamento o default 60 min
    const endTimeMinutes = timeMinutes + duration;
    
    // Verifica che non finisca dopo l'orario lavorativo del giorno
    const workingHours = getWorkingHoursForDay(new Date(date));
    const [endHourLimit, endMinuteLimit] = workingHours.afternoonEnd.split(':').map(Number);
    const endLimitMinutes = endHourLimit * 60 + endMinuteLimit;
    
    // Permette di prenotare se finisce esattamente all'orario di chiusura o prima
    if (endTimeMinutes > endLimitMinutes) return false;
    
    return !appointments.some(apt => {
      const aptStart = apt.startTime.split(':').map(Number);
      const aptStartMinutes = aptStart[0] * 60 + aptStart[1];
      const treatment = getTreatmentById(apt.treatmentId);
      const aptEndMinutes = aptStartMinutes + (treatment?.duration || 0);
      return timeMinutes >= aptStartMinutes && timeMinutes < aptEndMinutes;
    });
  };

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':').map(Number);
    return `${hour}:${minute.toString().padStart(2, '0')}`;
  };

  if (!isWorkingDay(new Date(date))) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">
          <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>Centro chiuso</p>
          <p className="text-sm text-gray-400 mt-2">
            {new Date(date).toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {capitalize(new Date(date).toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))}
        </h3>
        <div className="text-sm text-gray-500">
          {getWorkingHoursDescription(new Date(date))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-1 divide-y divide-gray-200">
          {timeSlots.map((time) => {
            const appointment = getAppointmentAtTime(time);
            const isOccupied = isTimeSlotOccupied(time);
            const canAdd = canAddAppointment(time);
            const canAdd30min = isTimeSlotAvailableForDuration(time, new Date(date), 30);
            const canAdd60min = isTimeSlotAvailableForDuration(time, new Date(date), 60);
            const isLunchBreakTime = isLunchBreak(time, new Date(date));

            if (isLunchBreakTime) {
              return (
                <div key={time} className="p-4 bg-gray-50 text-center text-gray-500">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Pausa pranzo
                </div>
              );
            }

            return (
              <div
                key={time}
                className={`p-4 ${
                  isOccupied ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-gray-600 w-16">
                      {formatTime(time)}
                    </div>
                    
                    {appointment ? (
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {appointment.clientName}
                            </div>
                            <div className="text-sm text-gray-600">
                              {getTreatmentById(appointment.treatmentId)?.name} • {getTreatmentById(appointment.treatmentId)?.duration} min
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <StatusBadge status={appointment.status} size="sm" />
                              {appointment.notes && (
                                <div className="text-xs text-gray-500">
                                  {appointment.notes}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => onEditAppointment(appointment)}
                              className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteAppointment(appointment.id)}
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1">
                        {canAdd ? (
                          <button
                            onClick={() => onAddAppointment(date, time)}
                            className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors duration-200"
                          >
                            <Plus className="w-4 h-4" />
                            <span className="text-sm">Aggiungi prenotazione</span>
                          </button>
                        ) : canAdd30min ? (
                          <button
                            onClick={() => onAddAppointment(date, time, 30)}
                            className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 px-3 py-2 rounded-lg transition-colors duration-200"
                          >
                            <Plus className="w-4 h-4" />
                            <span className="text-sm">Aggiungi prenotazione (max 30 min)</span>
                          </button>
                        ) : canAdd60min ? (
                          <div className="text-sm text-gray-600">
                            <span className="text-green-600">Disponibile per trattamenti di 60 min</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">
                            {!isWorkingHour(time, new Date(date)) ? 'Fuori orario lavorativo' : 'Slot occupato'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DayView;
