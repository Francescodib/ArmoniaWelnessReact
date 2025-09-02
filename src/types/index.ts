export interface Treatment {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
  category: 'massage' | 'facial' | 'body' | 'wellness';
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  treatmentId: string;
  treatment: Treatment;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime?: string; // HH:MM - opzionale, calcolato dinamicamente
  notes?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkingHours {
  monday: { start: string; end: string; afternoonStart: string; afternoonEnd: string };
  tuesday: { start: string; end: string; afternoonStart: string; afternoonEnd: string };
  wednesday: { start: string; end: string; afternoonStart: string; afternoonEnd: string };
  thursday: { start: string; end: string; afternoonStart: string; afternoonEnd: string };
  friday: { start: string; end: string; afternoonStart: string; afternoonEnd: string };
  saturday: { start: string; end: string; afternoonStart: string; afternoonEnd: string };
  sunday: { start: string; end: string; afternoonStart: string; afternoonEnd: string };
}

export interface User {
  username: string;
  isAuthenticated: boolean;
}

export type ViewMode = 'day' | 'week' | 'month';

