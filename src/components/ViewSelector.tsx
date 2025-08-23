import React from 'react';
import { Calendar, CalendarDays, CalendarRange } from 'lucide-react';
import type { ViewMode } from '../types/index';

interface ViewSelectorProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

const ViewSelector: React.FC<ViewSelectorProps> = ({ currentView, onViewChange }) => {
  const views = [
    { id: 'day' as ViewMode, label: 'Giorno', icon: Calendar },
    { id: 'week' as ViewMode, label: 'Settimana', icon: CalendarRange },
    { id: 'month' as ViewMode, label: 'Mese', icon: CalendarDays },
  ];

  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      {views.map((view) => {
        const Icon = view.icon;
        const isActive = currentView === view.id;
        
        return (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              isActive
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{view.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ViewSelector;
