import React, { useState, useEffect } from 'react';
import { X, Clock, User, Phone, Mail, FileText } from 'lucide-react';
import type { Appointment, Treatment } from '../types/index';
import { isWorkingHour, getWorkingHoursForDay, generateTimeSlots } from '../config/workingHours';
import TimeSlotInfo from './TimeSlotInfo';

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'endTime'>) => void;
  appointment?: Appointment;
  treatments: Treatment[];
  selectedDate?: string;
  selectedTime?: string;
  maxDuration?: number; // Durata massima consentita per questo slot
  existingAppointments?: Appointment[]; // Per controllare sovrapposizioni
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  appointment,
  treatments,
  selectedDate,
  selectedTime,
  maxDuration,
  existingAppointments
}) => {
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    treatmentId: '',
    date: '',
    startTime: '',
    notes: '',
    status: 'confirmed' as 'confirmed' | 'pending'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Genera slot orari disponibili per la data selezionata
  const getAvailableTimeSlots = () => {
    if (!formData.date) return [];
    
    const date = new Date(formData.date);
    const allSlots = generateTimeSlots(date);
    
    if (!existingAppointments || !formData.treatmentId) return allSlots;
    
    const selectedTreatment = treatments.find(t => t.id === formData.treatmentId);
    if (!selectedTreatment) return allSlots;
    
    // Filtra slot che non causano sovrapposizioni
    return allSlots.filter(slot => {
      // Verifica se lo slot è nell'orario lavorativo
      if (!isWorkingHour(slot, date)) return false;
      
      // Verifica che non finisca dopo l'orario lavorativo
      const [hour, minute] = slot.split(':').map(Number);
      const startMinutes = hour * 60 + minute;
      const endMinutes = startMinutes + selectedTreatment.duration;
      const endHour = Math.floor(endMinutes / 60);
      const workingHours = getWorkingHoursForDay(date);
      const [endHourLimit] = workingHours.afternoonEnd.split(':').map(Number);
      
      if (endHour >= endHourLimit) return false;
      
      // Verifica sovrapposizioni con appuntamenti esistenti
      const conflictingAppointment = existingAppointments.find(apt => {
        if (apt.date !== formData.date) return false;
        if (appointment && apt.id === appointment.id) return false; // Esclude appuntamento corrente
        
        const aptStart = apt.startTime.split(':').map(Number);
        const aptStartMinutes = aptStart[0] * 60 + aptStart[1];
        const aptTreatment = treatments.find(t => t.id === apt.treatmentId);
        const aptEndMinutes = aptStartMinutes + (aptTreatment?.duration || 0);
        
        // Controlla se c'è sovrapposizione
        return (startMinutes < aptEndMinutes && endMinutes > aptStartMinutes);
      });
      
      return !conflictingAppointment;
    });
  };

  // Genera tutti gli slot per mostrare anche quelli non disponibili
  const getAllTimeSlots = () => {
    if (!formData.date) return [];
    return generateTimeSlots(new Date(formData.date));
  };

  const allTimeSlots = getAllTimeSlots();

  const availableTimeSlots = getAvailableTimeSlots();

  useEffect(() => {
    if (appointment) {
      setFormData({
        clientName: appointment.clientName,
        clientPhone: appointment.clientPhone,
        clientEmail: appointment.clientEmail,
        treatmentId: appointment.treatmentId,
        date: appointment.date,
        startTime: appointment.startTime,
        notes: appointment.notes || '',
        status: appointment.status
      });
    } else if (selectedDate && selectedTime) {
      setFormData(prev => ({
        ...prev,
        date: selectedDate,
        startTime: selectedTime
      }));
    }
  }, [appointment, selectedDate, selectedTime]);

  // Reset orario quando cambia la data o il trattamento
  useEffect(() => {
    if (formData.date && formData.treatmentId) {
      const availableSlots = getAvailableTimeSlots();
      if (availableSlots.length > 0 && !availableSlots.includes(formData.startTime)) {
        setFormData(prev => ({ ...prev, startTime: availableSlots[0] }));
      }
    }
  }, [formData.date, formData.treatmentId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Il nome del cliente è obbligatorio';
    }

    if (!formData.clientPhone.trim()) {
      newErrors.clientPhone = 'Il telefono è obbligatorio';
    }

    if (!formData.clientEmail.trim()) {
      newErrors.clientEmail = 'L\'email è obbligatoria';
    } else if (!/\S+@\S+\.\S+/.test(formData.clientEmail)) {
      newErrors.clientEmail = 'L\'email non è valida';
    }

    if (!formData.treatmentId) {
      newErrors.treatmentId = 'Seleziona un trattamento';
    }

    if (!formData.date) {
      newErrors.date = 'Seleziona una data';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Seleziona un orario';
    }

    // Validazione orari lavorativi e sovrapposizioni
    if (formData.treatmentId && formData.startTime) {
      const selectedTreatment = treatments.find(t => t.id === formData.treatmentId);
      if (selectedTreatment) {
        // Controllo che l'orario sia tra quelli disponibili
        if (!availableTimeSlots.includes(formData.startTime)) {
          newErrors.startTime = 'L\'orario selezionato non è più disponibile';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const selectedTreatment = treatments.find(t => t.id === formData.treatmentId);
    if (!selectedTreatment) return;
    
    const appointmentData = {
      clientName: formData.clientName.trim(),
      clientPhone: formData.clientPhone.trim(),
      clientEmail: formData.clientEmail.trim(),
      treatmentId: formData.treatmentId,
      date: formData.date,
      startTime: formData.startTime,
      notes: formData.notes.trim(),
      status: formData.status
    };

    onSubmit(appointmentData);
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {appointment ? 'Modifica Prenotazione' : 'Nuova Prenotazione'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Cliente *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => handleInputChange('clientName', e.target.value)}
                className={`input-field pl-10 ${errors.clientName ? 'border-red-500' : ''}`}
                placeholder="Nome e cognome"
              />
            </div>
            {errors.clientName && (
              <p className="text-red-500 text-sm mt-1">{errors.clientName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefono *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="tel"
                value={formData.clientPhone}
                onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                className={`input-field pl-10 ${errors.clientPhone ? 'border-red-500' : ''}`}
                placeholder="Numero di telefono"
              />
            </div>
            {errors.clientPhone && (
              <p className="text-red-500 text-sm mt-1">{errors.clientPhone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                value={formData.clientEmail}
                onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                className={`input-field pl-10 ${errors.clientEmail ? 'border-red-500' : ''}`}
                placeholder="Indirizzo email"
              />
            </div>
            {errors.clientEmail && (
              <p className="text-red-500 text-sm mt-1">{errors.clientEmail}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trattamento *
            </label>
            <select
              value={formData.treatmentId}
              onChange={(e) => handleInputChange('treatmentId', e.target.value)}
              className={`input-field ${errors.treatmentId ? 'border-red-500' : ''}`}
            >
              <option value="">Seleziona trattamento</option>
              {treatments.map((treatment) => {
                // Verifica se il trattamento è disponibile per questo slot
                const isAvailable = availableTimeSlots.length > 0;
                const isTooLong = maxDuration && treatment.duration > maxDuration;
                const wouldOverlap = !isAvailable && !isTooLong;
                
                let reason = '';
                if (isTooLong) {
                  reason = ` - Troppo lungo per questo slot (max ${maxDuration} min)`;
                } else if (wouldOverlap) {
                  reason = ' - Causerebbe sovrapposizioni';
                }
                
                return (
                  <option 
                    key={treatment.id} 
                    value={treatment.id}
                    disabled={!isAvailable}
                    className={!isAvailable ? 'text-gray-400' : ''}
                  >
                    {treatment.name} ({treatment.duration} min - €{treatment.price}){reason}
                  </option>
                );
              })}
            </select>
            {errors.treatmentId && (
              <p className="text-red-500 text-sm mt-1">{errors.treatmentId}</p>
            )}
            {maxDuration && (
              <p className="text-xs text-blue-600 mt-1">
                💡 Durata massima consentita per questo slot: {maxDuration} minuti
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={`input-field ${errors.date ? 'border-red-500' : ''}`}
              />
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date}</p>
              )}
            </div>

                         <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Orario *
               </label>
               <div className="relative">
                 <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                 <select
                   value={formData.startTime}
                   onChange={(e) => handleInputChange('startTime', e.target.value)}
                   className={`input-field pl-10 ${errors.startTime ? 'border-red-500' : ''}`}
                   disabled={allTimeSlots.length === 0}
                 >
                   <option value="">
                     {allTimeSlots.length === 0 ? 'Nessuno slot disponibile' : 'Seleziona orario'}
                   </option>
                   {allTimeSlots.map((slot) => {
                     const isAvailable = availableTimeSlots.includes(slot);
                     const isWorking = isWorkingHour(slot, new Date(formData.date));
                     
                     return (
                       <option 
                         key={slot} 
                         value={slot}
                         disabled={!isAvailable}
                         className={!isAvailable ? 'text-gray-400' : ''}
                       >
                         {slot} {!isAvailable ? (isWorking ? '(Occupato)' : '(Fuori orario)') : ''}
                       </option>
                     );
                   })}
                 </select>
               </div>
               {errors.startTime && (
                 <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
               )}
               <div className="mt-2">
                 <TimeSlotInfo
                   availableSlots={availableTimeSlots}
                   selectedDate={formData.date}
                   selectedTreatment={formData.treatmentId}
                   totalSlots={formData.date ? generateTimeSlots(new Date(formData.date)).length : undefined}
                   showOccupiedInfo={true}
                 />
               </div>
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="input-field pl-10 resize-none"
                rows={3}
                placeholder="Note aggiuntive..."
              />
            </div>
          </div>

          {/* Campo Status - visibile solo in modalità modifica */}
          {appointment && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Prenotazione
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="input-field"
              >
                               <option value="confirmed">✅ Confermata</option>
               <option value="pending">⏳ In Attesa</option>
              </select>
                             <p className="text-xs text-gray-500 mt-1">
                 {formData.status === 'confirmed' && 'Cliente ha confermato la prenotazione'}
                 {formData.status === 'pending' && 'In attesa di conferma del cliente'}
               </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
            >
              {appointment ? 'Aggiorna' : 'Crea'} Prenotazione
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm;