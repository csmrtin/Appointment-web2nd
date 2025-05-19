export interface Appointment {
  id?: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  date: Date;
  time: string;
  reason?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  availableHours: string[];  // Array of time slots like ['09:00', '10:00', etc.]
  availableDays: string[];   // Array of days like ['Monday', 'Wednesday', etc.]
}

export interface Patient {
  id?: string;
  name: string;
  email: string;
  phone: string;
}

export interface Location {
  id?: string;
  name: string;
  address: string;
  city: string;
} 