import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface DateNavigatorProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  viewMode: 'day' | 'week' | 'month';
}

const DateNavigator: React.FC<DateNavigatorProps> = ({ 
  currentDate, 
  onDateChange, 
  viewMode 
}) => {
  const formatDate = (date: Date, mode: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
    };

    if (mode === 'day') {
      options.day = 'numeric';
      options.weekday = 'long';
    } else if (mode === 'week') {
      const startOfWeek = new Date(date);
      const endOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay() + 1);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return `${startOfWeek.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })} - ${endOfWeek.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    }

    return date.toLocaleDateString('it-IT', options);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    if (viewMode === 'day') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (viewMode === 'month') {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => navigateDate('prev')}
        className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-3">
        <Calendar className="w-5 h-5 text-indigo-600" />
        <h2 className="text-xl font-semibold text-gray-900">
          {formatDate(currentDate, viewMode)}
        </h2>
      </div>

      <button
        onClick={() => navigateDate('next')}
        className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <button
        onClick={goToToday}
        className="btn-outline text-sm px-3 py-1"
      >
        Oggi
      </button>
    </div>
  );
};

export default DateNavigator;
