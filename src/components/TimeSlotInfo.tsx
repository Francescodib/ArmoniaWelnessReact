import React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

interface TimeSlotInfoProps {
  availableSlots: string[];
  selectedDate?: string;
  selectedTreatment?: string;
  totalSlots?: number;
  showOccupiedInfo?: boolean;
}

const TimeSlotInfo: React.FC<TimeSlotInfoProps> = ({
  availableSlots,
  selectedDate,
  selectedTreatment,
  totalSlots,
  showOccupiedInfo = false
}) => {
  if (!selectedDate) {
    return (
      <div className="flex items-center gap-2 text-blue-600 text-sm">
        <Info className="w-4 h-4" />
        <span>Seleziona una data per vedere gli slot disponibili</span>
      </div>
    );
  }

  if (!selectedTreatment) {
    return (
      <div className="flex items-center gap-2 text-blue-600 text-sm">
        <Info className="w-4 h-4" />
        <span>Seleziona un trattamento per vedere gli slot disponibili</span>
      </div>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <div className="flex items-center gap-2 text-amber-600 text-sm">
        <AlertCircle className="w-4 h-4" />
        <span>Nessuno slot disponibile per questa data e trattamento</span>
      </div>
    );
  }

  const firstSlot = availableSlots[0];
  const lastSlot = availableSlots[availableSlots.length - 1];
  const availabilityPercentage = totalSlots ? Math.round((availableSlots.length / totalSlots) * 100) : 0;
  const occupiedSlots = totalSlots ? totalSlots - availableSlots.length : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-green-600 text-sm">
        <CheckCircle className="w-4 h-4" />
        <span className="font-medium">{availableSlots.length} slot disponibili</span>
        {showOccupiedInfo && totalSlots && (
          <span className="text-gray-500">• {occupiedSlots} occupati</span>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
        <div>
          <span className="font-medium">Primo slot:</span> {firstSlot}
        </div>
        <div>
          <span className="font-medium">Ultimo slot:</span> {lastSlot}
        </div>
        {totalSlots && (
          <div className="col-span-2">
            <span className="font-medium">Disponibilità:</span> {availabilityPercentage}% 
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${availabilityPercentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeSlotInfo;
