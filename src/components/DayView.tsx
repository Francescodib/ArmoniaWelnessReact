import React from 'react';
import { Plus, Edit, Trash2, Clock } from 'lucide-react';
import type { Appointment, Treatment } from '../types/index';
import { capitalize } from '../utils/utils';
import StatusBadge from './StatusBadge';
import { 
  isWorkingDay, 
  isWorkingHour, 
  generateTimeSlots, 
  getWorkingHoursDescription,
  isWithinWorkingHours,
  conflictsWithLunchBreak,
  hasAppointmentConflict,
  filterAppointmentsInWorkingHours,
  isDateInPast,
  isTimeBookable
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
  
  // Aggiunge un blocco di pausa pranzo se necessario
  const timeSlotsWithLunchBreak = (() => {
    const dateObj = new Date(date);
    if (dateObj.getDay() === 0 || dateObj.getDay() === 6) return timeSlots; // Weekend
    
    const slots = [...timeSlots];
    const lunchBreakIndex = slots.findIndex(slot => {
      const [hour] = slot.split(':').map(Number);
      return hour >= 13; // Trova il primo slot del pomeriggio
    });
    
    if (lunchBreakIndex > 0) {
      // Inserisce il blocco di pausa pranzo prima del primo slot del pomeriggio
      slots.splice(lunchBreakIndex, 0, 'lunch-break');
    }
    
    return slots;
  })();

  const getAppointmentAtTime = (time: string) => {
    const filteredAppointments = filterAppointmentsInWorkingHours(appointments);
    return filteredAppointments.find(apt => apt.startTime === time);
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
    const filteredAppointments = filterAppointmentsInWorkingHours(appointments);
    return filteredAppointments.some(apt => {
      const aptStart = apt.startTime;
      const aptEnd = getAppointmentEndTime(apt);
      return time >= aptStart && time < aptEnd;
    });
  };

  // Le funzioni isDateInPast, isTimeInPast e isTimeBookable sono ora importate dalla configurazione

  const canAddAppointment = (time: string, treatmentDuration?: number) => {
    // Verifica se l'orario è prenotabile (non nel passato)
    if (!isTimeBookable(time, date)) return false;
    
    if (!isWorkingDay(new Date(date)) || !isWorkingHour(time, new Date(date))) return false;
    if (isTimeSlotOccupied(time)) return false;
    
    const duration = treatmentDuration || 60; // Durata del trattamento o default 60 min
    
    // Verifica che non finisca dopo l'orario lavorativo
    if (!isWithinWorkingHours(time, duration, new Date(date))) return false;
    
    // Verifica che non si sovrapponga alla pausa pranzo
    if (conflictsWithLunchBreak(time, duration, new Date(date))) return false;
    
    // Verifica conflitti con appuntamenti esistenti
    const filteredAppointments = filterAppointmentsInWorkingHours(appointments);
    if (hasAppointmentConflict(time, duration, filteredAppointments, treatments)) return false;
    
    return true;
  };

  // Helper per verificare se uno slot è disponibile per una durata specifica considerando i conflitti
  const isTimeSlotAvailableForDurationWithConflicts = (time: string, duration: number) => {
    // Verifica se l'orario è prenotabile (non nel passato)
    if (!isTimeBookable(time, date)) return false;
    
    if (!isWorkingDay(new Date(date)) || !isWorkingHour(time, new Date(date))) return false;
    
    // Verifica che non finisca dopo l'orario lavorativo
    if (!isWithinWorkingHours(time, duration, new Date(date))) return false;
    
    // Verifica che non si sovrapponga alla pausa pranzo
    if (conflictsWithLunchBreak(time, duration, new Date(date))) return false;
    
    // Verifica conflitti con appuntamenti esistenti
    const filteredAppointments = filterAppointmentsInWorkingHours(appointments);
    if (hasAppointmentConflict(time, duration, filteredAppointments, treatments)) return false;
    
    return true;
  };

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':').map(Number);
    return `${hour}:${minute.toString().padStart(2, '0')}`;
  };

  // Non blocchiamo più la visualizzazione per le date passate, 
  // ma impediamo solo le prenotazioni tramite canAddAppointment

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
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">
            {capitalize(new Date(date).toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))}
          </h3>
          {isDateInPast(date) && (
            <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
              Data passata
            </span>
          )}
        </div>
        <div className="text-sm text-gray-500">
          {getWorkingHoursDescription(new Date(date))}
        </div>
      </div>
      
      {isDateInPast(date) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <p className="text-sm text-amber-800">
              <strong>Modalità consultazione:</strong> Puoi visualizzare gli appuntamenti esistenti ma non è possibile aggiungere nuove prenotazioni per date passate.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-1 divide-y divide-gray-200">
          {timeSlotsWithLunchBreak.map((time) => {
            // Gestisce il blocco di pausa pranzo
            if (time === 'lunch-break') {
              return (
                <div key="lunch-break" className="p-4 bg-amber-50 border-l-4 border-amber-400 text-center">
                  <Clock className="w-4 h-4 inline mr-2 text-amber-600" />
                  <span className="text-amber-700 font-medium">Pausa pranzo</span>
                  <div className="text-xs text-amber-600 mt-1">13:00 - 14:00</div>
                </div>
              );
            }
            
            const appointment = getAppointmentAtTime(time);
            const isOccupied = isTimeSlotOccupied(time);
            const canAdd = canAddAppointment(time);
            const canAdd30min = isTimeSlotAvailableForDurationWithConflicts(time, 30);
            const canAdd60min = isTimeSlotAvailableForDurationWithConflicts(time, 60);

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
                              title="Modifica appuntamento"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteAppointment(appointment.id)}
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                              title="Elimina appuntamento"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1">
                        {isDateInPast(date) ? (
                          <span className="text-gray-400 text-sm">
                            Slot libero (solo consultazione)
                          </span>
                        ) : !isTimeBookable(time, date) ? (
                          <span className="text-gray-400 text-sm">
                            
                          </span>
                        ) : canAdd ? (
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
                            {!isWorkingHour(time, new Date(date)) 
                              ? 'Fuori orario lavorativo' 
                              : 'Slot occupato'
                            }
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
