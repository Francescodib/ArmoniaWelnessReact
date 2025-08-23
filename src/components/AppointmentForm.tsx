import React, { useState, useEffect } from 'react';
import { X, Clock, User, Phone, Mail, FileText } from 'lucide-react';
import type { Appointment, Treatment } from '../types/index';

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  appointment?: Appointment;
  treatments: Treatment[];
  selectedDate?: string;
  selectedTime?: string;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  appointment,
  treatments,
  selectedDate,
  selectedTime
}) => {
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    treatmentId: '',
    date: '',
    startTime: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (appointment) {
      setFormData({
        clientName: appointment.clientName,
        clientPhone: appointment.clientPhone,
        clientEmail: appointment.clientEmail,
        treatmentId: appointment.treatmentId,
        date: appointment.date,
        startTime: appointment.startTime,
        notes: appointment.notes || ''
      });
    } else if (selectedDate && selectedTime) {
      setFormData(prev => ({
        ...prev,
        date: selectedDate,
        startTime: selectedTime
      }));
    }
  }, [appointment, selectedDate, selectedTime]);

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const selectedTreatment = treatments.find(t => t.id === formData.treatmentId);
    if (!selectedTreatment) return;

    const startTime = new Date(`2000-01-01T${formData.startTime}`);
    const endTime = new Date(startTime.getTime() + selectedTreatment.duration * 60000);
    
    const appointmentData = {
      clientName: formData.clientName.trim(),
      clientPhone: formData.clientPhone.trim(),
      clientEmail: formData.clientEmail.trim(),
      treatmentId: formData.treatmentId,
      treatment: selectedTreatment,
      date: formData.date,
      startTime: formData.startTime,
      endTime: endTime.toTimeString().slice(0, 5),
      notes: formData.notes.trim(),
      status: 'confirmed' as const
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
              {treatments.map((treatment) => (
                <option key={treatment.id} value={treatment.id}>
                  {treatment.name} ({treatment.duration} min - €{treatment.price})
                </option>
              ))}
            </select>
            {errors.treatmentId && (
              <p className="text-red-500 text-sm mt-1">{errors.treatmentId}</p>
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
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  className={`input-field pl-10 ${errors.startTime ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.startTime && (
                <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
              )}
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
