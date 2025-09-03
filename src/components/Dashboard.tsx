import React, { useState } from 'react';
import { Plus, Calendar, Users, Clock, TrendingUp } from 'lucide-react';
import type { Appointment, Treatment, ViewMode } from '../types/index';
import ViewSelector from './ViewSelector';
import DateNavigator from './DateNavigator';
import DayView from './DayView';
import WeekView from './WeekView';
import MonthView from './MonthView';
import AppointmentForm from './AppointmentForm';
import { formatDateToISOString } from '../utils/utils';

// Sample treatments data
const sampleTreatments: Treatment[] = [
  {
    id: '1',
    name: 'Massaggio Rilassante',
    duration: 60,
    price: 80,
    category: 'massage'
  },
  {
    id: '2',
    name: 'Massaggio Sportivo',
    duration: 45,
    price: 70,
    category: 'massage'
  },
  {
    id: '3',
    name: 'Trattamento Viso',
    duration: 30,
    price: 50,
    category: 'facial'
  },
  {
    id: '4',
    name: 'Trattamento Corpo',
    duration: 90,
    price: 120,
    category: 'body'
  },
  {
    id: '5',
    name: 'Sauna',
    duration: 45,
    price: 40,
    category: 'wellness'
  }
];

// Dati di esempio per le prenotazioni
const sampleAppointments: Appointment[] = [
  {
    id: '1',
    clientName: 'Maria Rossi',
    clientPhone: '+39 123 456 789',
    clientEmail: 'maria.rossi@email.com',
    treatmentId: '1',
    date: formatDateToISOString(new Date()),
    startTime: '10:00',
    notes: 'Cliente preferisce olio essenziale alla lavanda',
    status: 'confirmed',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    clientName: 'Giuseppe Bianchi',
    clientPhone: '+39 987 654 321',
    clientEmail: 'giuseppe.bianchi@email.com',
    treatmentId: '2',
    date: formatDateToISOString(new Date()),
    startTime: '14:30',
    notes: '',
    status: 'confirmed',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    clientName: 'Giuseppe Bianchi',
    clientPhone: '+39 987 654 321',
    clientEmail: 'giuseppe.bianchi@email.com',
    treatmentId: '3',
    date: formatDateToISOString(new Date(new Date().setDate(new Date().getDate() + 1))),
    startTime: '14:30',
    notes: '',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    clientName: 'Francesco Verdi',
    clientPhone: '+39 234 567 890',
    clientEmail: 'francesco.verdi@email.com',
    treatmentId: '4',
    date: formatDateToISOString(new Date(new Date().setDate(new Date().getDate() + 1))),
    startTime: '11:30',
    notes: '',
    status: 'confirmed',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '5',
    clientName: 'Anna Neri',
    clientPhone: '+39 345 678 901',
    clientEmail: 'anna.neri@email.com',
    treatmentId: '5',
    date: formatDateToISOString(new Date(new Date().setDate(new Date().getDate() + 2))),
    startTime: '15:00',
    notes: 'Prima volta, cliente timida',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const Dashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>(sampleAppointments);
  const [treatments] = useState<Treatment[]>(sampleTreatments);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | undefined>();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [maxDuration, setMaxDuration] = useState<number | undefined>(undefined);

  // Helper function per ottenere il trattamento da treatmentId
  const getTreatmentById = (treatmentId: string): Treatment | undefined => {
    return treatments.find(t => t.id === treatmentId);
  };

  // Statistiche
  const todayAppointments = appointments.filter(apt => apt.date === formatDateToISOString(new Date()));
  const totalAppointments = appointments.length;
  const confirmedAppointments = appointments.filter(apt => apt.status === 'confirmed').length;
  const pendingAppointments = appointments.filter(apt => apt.status === 'pending').length;
  
  // Calcolo incasso in base alla vista corrente
  const getCurrentPeriodIncome = () => {
    const today = formatDateToISOString(new Date());
    
    if (currentView === 'day') {
      // Incasso giornaliero (solo appuntamenti confermati)
      return appointments
        .filter(apt => apt.date === today && apt.status === 'confirmed')
        .reduce((total, apt) => {
          const treatment = getTreatmentById(apt.treatmentId);
          return total + (treatment?.price || 0);
        }, 0);
    } else if (currentView === 'week') {
      // Incasso settimanale
      const weekStart = getWeekStartDate(currentDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      return appointments
        .filter(apt => {
          const aptDate = new Date(apt.date);
          return aptDate >= weekStart && aptDate <= weekEnd && apt.status === 'confirmed';
        })
        .reduce((total, apt) => {
          const treatment = getTreatmentById(apt.treatmentId);
          return total + (treatment?.price || 0);
        }, 0);
    } else {
      // Incasso mensile
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      return appointments
        .filter(apt => {
          const aptDate = new Date(apt.date);
          return aptDate >= monthStart && aptDate <= monthEnd && apt.status === 'confirmed';
        })
        .reduce((total, apt) => {
          const treatment = getTreatmentById(apt.treatmentId);
          return total + (treatment?.price || 0);
        }, 0);
    }
  };
  
  const getWeekStartDate = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Lunedì = 1
    const result = new Date(date);
    result.setDate(diff);
    return result;
  };

  const currentPeriodIncome = getCurrentPeriodIncome();

  const handleAddAppointment = (date: string, time: string, maxDuration?: number) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setEditingAppointment(undefined);
    setIsFormOpen(true);
    // Passa la durata massima al form
    setMaxDuration(maxDuration);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setSelectedDate('');
    setSelectedTime('');
    setIsFormOpen(true);
  };

  const handleDeleteAppointment = (id: string) => {
    if (window.confirm('Sei sicuro di voler cancellare questa prenotazione?')) {
      setAppointments(prev => prev.filter(apt => apt.id !== id));
    }
  };

  const handleSubmitAppointment = (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'endTime'>) => {
    if (editingAppointment) {
      // Modifica prenotazione esistente
      setAppointments(prev => prev.map(apt => 
        apt.id === editingAppointment.id 
          ? { ...appointmentData, id: apt.id, createdAt: apt.createdAt, updatedAt: new Date() }
          : apt
      ));
    } else {
      // Nuova prenotazione
      const newAppointment: Appointment = {
        ...appointmentData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setAppointments(prev => [...prev, newAppointment]);
    }
  };

  // Gestisce il cambio di vista e resetta la data a oggi quando si passa alla vista giorno
  const handleViewChange = (view: ViewMode) => {
    setCurrentView(view);
    if (view === 'day') {
      setCurrentDate(new Date());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header della dashboard */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Prenotazioni
              </h1>
              <p className="text-gray-600 mt-1">
                Gestisci le prenotazioni del centro benessere
              </p>
            </div>
            
            <button
              onClick={() => {
                setEditingAppointment(undefined);
                setSelectedDate('');
                setSelectedTime('');
                setIsFormOpen(true);
              }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nuova Prenotazione
            </button>
          </div>
        </div>
      </div>

      {/* Statistiche */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Calendar className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Oggi</p>
                <p className="text-2xl font-semibold text-gray-900">{todayAppointments.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-fuchsia-100 rounded-lg">
                <Users className="w-6 h-6 text-fuchsia-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Totali</p>
                <p className="text-2xl font-semibold text-gray-900">{totalAppointments}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confermate</p>
                <p className="text-2xl font-semibold text-gray-900">{confirmedAppointments}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Attesa</p>
                <p className="text-2xl font-semibold text-gray-900">{pendingAppointments}</p>
              </div>
            </div>
          </div>



          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {currentView === 'day' ? 'Fatturato Oggi' : 
                   currentView === 'week' ? 'Fatturato Settimana' : 'Fatturato Mese'}
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  €{currentPeriodIncome}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controlli di navigazione */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <ViewSelector currentView={currentView} onViewChange={handleViewChange} />
          <DateNavigator 
            currentDate={currentDate} 
            onDateChange={setCurrentDate} 
            viewMode={currentView} 
          />
        </div>
      </div>

      {/* Contenuto principale */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {currentView === 'day' && (
          <DayView
            date={formatDateToISOString(currentDate)}
            appointments={appointments.filter(apt => apt.date === formatDateToISOString(currentDate))}
            treatments={treatments}
            onAddAppointment={handleAddAppointment}
            onEditAppointment={handleEditAppointment}
            onDeleteAppointment={handleDeleteAppointment}
          />
        )}

        {currentView === 'week' && (
          <WeekView
            startDate={getWeekStartDate(currentDate)}
            appointments={appointments}
            treatments={treatments}
            onAddAppointment={handleAddAppointment}
            onEditAppointment={handleEditAppointment}
            onDeleteAppointment={handleDeleteAppointment}
          />
        )}

        {currentView === 'month' && (
          <MonthView
            currentDate={currentDate}
            appointments={appointments}
            treatments={treatments}
            onAddAppointment={handleAddAppointment}
            onEditAppointment={handleEditAppointment}
            onMonthChange={setCurrentDate}
          />
        )}
      </div>

      {/* Form per le prenotazioni */}
      <AppointmentForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitAppointment}
        appointment={editingAppointment}
        treatments={treatments}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        existingAppointments={appointments}
        maxDuration={maxDuration}
      />
    </div>
  );
};

export default Dashboard;
