import React from 'react';
import { Plus, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import type { Appointment } from '../types/index';

interface MonthViewProps {
  currentDate: Date;
  appointments: Appointment[];
  onAddAppointment: (date: string, time: string) => void;
  onEditAppointment: (appointment: Appointment) => void;
  onMonthChange: (date: Date) => void;
}

const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  appointments,
  onAddAppointment,
  onEditAppointment,
  onMonthChange
}) => {
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

  const isWorkingDay = (date: Date) => {
    const day = date.getDay();
    return day >= 1 && day <= 6; // Lunedì = 1, Sabato = 6
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getAppointmentsForDay = (date: string) => {
    return appointments.filter(apt => apt.date === date);
  };

  const formatDate = (date: Date) => {
    return date.getDate();
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    onMonthChange(newDate);
  };

  const goToToday = () => {
    onMonthChange(new Date());
  };

  return (
    <div className="space-y-4">
      {/* Header del mese */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-indigo-600" />
            <h3 className="text-2xl font-semibold text-gray-900">
              {getMonthName(currentDate)}
            </h3>
          </div>

          <button
            onClick={() => navigateMonth('next')}
            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={goToToday}
          className="btn-outline text-sm px-4 py-2"
        >
          Oggi
        </button>
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
            const dateStr = day.toISOString().split('T')[0];
            const dayAppointments = getAppointmentsForDay(dateStr);
            const isCurrentMonthDay = isCurrentMonth(day);
            const isTodayDay = isToday(day);
            const isWorking = isWorkingDay(day);

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[120px] p-2 ${
                  !isCurrentMonthDay ? 'bg-gray-50' : 'hover:bg-gray-50'
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
                    }`}
                  >
                    {formatDate(day)}
                  </span>
                  
                  {isWorking && isCurrentMonthDay && (
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
                        {appointment.startTime} • {appointment.treatment.name}
                      </div>
                    </div>
                  ))}
                  
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-gray-500 text-center py-1">
                      +{dayAppointments.length - 3} altre
                    </div>
                  )}
                </div>

                {/* Indicatore se il centro è chiuso */}
                {!isWorking && (
                  <div className="text-xs text-gray-400 text-center mt-2">
                    Chiuso
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-indigo-100 border border-indigo-200 rounded"></div>
          <span>Prenotazione</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
          <span>Centro chiuso</span>
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
