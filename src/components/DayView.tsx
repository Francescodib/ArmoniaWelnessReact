import React from 'react';
import { Plus, Edit, Trash2, Clock } from 'lucide-react';
import type { Appointment } from '../types/index';

interface DayViewProps {
  date: string;
  appointments: Appointment[];
  onAddAppointment: (date: string, time: string) => void;
  onEditAppointment: (appointment: Appointment) => void;
  onDeleteAppointment: (id: string) => void;
}

const DayView: React.FC<DayViewProps> = ({
  date,
  appointments,
  onAddAppointment,
  onEditAppointment,
  onDeleteAppointment
}) => {
  const timeSlots = [];
  const startHour = 9;
  const endHour = 18;
  
  // Genera slot orari dalle 9 alle 18
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeSlots.push(time);
    }
  }

  const isWorkingDay = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    return day >= 1 && day <= 6; // Lunedì = 1, Sabato = 6
  };

  const isWorkingHour = (time: string) => {
    const [hour] = time.split(':').map(Number);
    if (hour < 9 || hour >= 18) return false;
    if (hour === 13) return false; // Pausa pranzo
    return true;
  };

  const getAppointmentAtTime = (time: string) => {
    return appointments.find(apt => apt.startTime === time);
  };

  const getAppointmentEndTime = (appointment: Appointment) => {
    const [startHour, startMinute] = appointment.startTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = startMinutes + appointment.treatment.duration;
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

  const canAddAppointment = (time: string) => {
    if (!isWorkingDay(date) || !isWorkingHour(time)) return false;
    if (isTimeSlotOccupied(time)) return false;
    
    // Verifica che non ci siano sovrapposizioni
    const [hour, minute] = time.split(':').map(Number);
    const timeMinutes = hour * 60 + minute;
    
    return !appointments.some(apt => {
      const aptStart = apt.startTime.split(':').map(Number);
      const aptStartMinutes = aptStart[0] * 60 + aptStart[1];
      const aptEndMinutes = aptStartMinutes + apt.treatment.duration;
      return timeMinutes >= aptStartMinutes && timeMinutes < aptEndMinutes;
    });
  };

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':').map(Number);
    return `${hour}:${minute.toString().padStart(2, '0')}`;
  };

  if (!isWorkingDay(date)) {
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
          {new Date(date).toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </h3>
        <div className="text-sm text-gray-500">
          Orario: 9:00 - 13:00, 14:00 - 18:00
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-1 divide-y divide-gray-200">
          {timeSlots.map((time) => {
            const appointment = getAppointmentAtTime(time);
            const isOccupied = isTimeSlotOccupied(time);
            const canAdd = canAddAppointment(time);
            const isLunchBreak = time === '13:00';

            if (isLunchBreak) {
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
                              {appointment.treatment.name} • {appointment.treatment.duration} min
                            </div>
                            {appointment.notes && (
                              <div className="text-xs text-gray-500 mt-1">
                                {appointment.notes}
                              </div>
                            )}
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
                        ) : (
                          <span className="text-gray-400 text-sm">
                            Slot occupato
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
