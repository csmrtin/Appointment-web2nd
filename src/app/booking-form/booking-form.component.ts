import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { AppointmentService } from '../appointment.service';
import { Doctor, Appointment } from '../shared/models';
import { auth } from '../firebase.config';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    RouterModule
  ],
  templateUrl: './booking-form.component.html',
  styleUrl: './booking-form.component.scss'
})
export class BookingFormComponent implements OnInit {
  bookingForm!: FormGroup;
  doctors: Doctor[] = [
    {
      id: '1',
      name: 'Dr. Nagy János',
      specialization: 'Belgyógyászat',
      availableHours: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      availableDays: ['Monday', 'Wednesday', 'Friday']
    },
    {
      id: '2',
      name: 'Dr. Kovács Éva',
      specialization: 'Kardiológia',
      availableHours: ['08:00', '09:00', '10:00', '13:00', '14:00', '15:00'],
      availableDays: ['Tuesday', 'Thursday']
    },
    {
      id: '3',
      name: 'Dr. Szabó Péter',
      specialization: 'Neurológia',
      availableHours: ['10:00', '11:00', '12:00', '15:00', '16:00', '17:00'],
      availableDays: ['Monday', 'Wednesday', 'Friday']
    }
  ];
  availableTimes: string[] = [];
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.bookingForm = this.fb.group({
      patientName: ['', Validators.required],
      doctorId: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      reason: ['']
    });

    // Figyeljük a dátum változását
    this.bookingForm.get('date')?.valueChanges.subscribe(date => {
      if (date) {
        this.updateAvailableTimes(date);
      }
    });

    // Figyeljük az orvos változását
    this.bookingForm.get('doctorId')?.valueChanges.subscribe(doctorId => {
      const date = this.bookingForm.get('date')?.value;
      if (date) {
        this.updateAvailableTimes(date);
      }
    });
  }

  private updateAvailableTimes(date: Date): void {
    const doctorId = this.bookingForm.get('doctorId')?.value;
    const doctor = this.doctors.find(d => d.id === doctorId);
    
    if (!doctor) {
      this.availableTimes = [];
      return;
    }

    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    if (!doctor.availableDays.includes(dayOfWeek)) {
      this.availableTimes = [];
      this.errorMessage = 'A kiválasztott napon nem rendel az orvos';
      return;
    }

    this.errorMessage = '';
    this.availableTimes = doctor.availableHours;
  }

  onSubmit(): void {
    if (this.bookingForm.valid && auth.currentUser?.uid) {
      const formValue = this.bookingForm.value;
      
      // Ellenőrizzük, hogy a dátum érvényes-e
      if (!(formValue.date instanceof Date) || isNaN(formValue.date.getTime())) {
        this.errorMessage = 'Érvénytelen dátum';
        this.snackBar.open('Kérjük, válasszon érvényes dátumot!', 'Bezárás', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
        return;
      }

      // Állítsuk be a dátumot az időpontra
      const appointmentDate = new Date(formValue.date);
      const [hours, minutes] = formValue.time.split(':').map(Number);
      appointmentDate.setHours(hours, minutes, 0, 0);

      const appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'> = {
        patientName: formValue.patientName,
        doctorId: formValue.doctorId,
        date: appointmentDate,
        time: formValue.time,
        reason: formValue.reason || '',
        status: 'pending',
        patientId: auth.currentUser.uid
      };

      console.log('Sending appointment data:', appointmentData);

      this.appointmentService.createAppointment(appointmentData).subscribe({
        next: (id) => {
          console.log('Appointment created with id:', id);
          this.snackBar.open('Sikeres időpontfoglalás!', 'OK', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/appointments']);
        },
        error: (error) => {
          console.error('Error creating appointment:', error);
          this.errorMessage = 'Hiba történt az időpont foglalása során: ' + (error.message || 'Ismeretlen hiba');
          this.snackBar.open('Hiba történt az időpont foglalása során!', 'Bezárás', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });
    } else if (!auth.currentUser?.uid) {
      this.errorMessage = 'Nincs bejelentkezett felhasználó';
      this.snackBar.open('Kérjük, jelentkezzen be a foglaláshoz!', 'Bezárás', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/appointments']);
  }
}
