import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AppointmentService } from '../appointment.service';
import { Appointment, Doctor } from '../shared/models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppointmentItemComponent } from '../appointment-item/appointment-item.component';
import { AuthService } from '../auth/auth.service';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    RouterModule,
    AppointmentItemComponent
  ],
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.scss']
})
export class AppointmentComponent implements OnInit, OnDestroy {
  appointments: Appointment[] = [];
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

  private appointmentsSubscription: Subscription | undefined;
  currentUser: User | null = null;

  constructor(
    private appointmentService: AppointmentService,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadAppointments();
  }

  ngOnDestroy(): void {
    this.appointmentsSubscription?.unsubscribe();
  }

  loadAppointments(): void {
    this.appointmentsSubscription = this.appointmentService.getAppointments().subscribe({
      next: (appointments) => {
        this.appointments = appointments;
      },
      error: (error) => {
        console.error('Hiba az időpontok betöltésekor:', error);
        this.snackBar.open('Hiba az időpontok betöltésekor', 'Bezárás', {
          duration: 3000
        });
      }
    });
  }

  getDoctorName(doctorId: string): string {
    const doctor = this.doctors.find(d => d.id === doctorId);
    return doctor ? doctor.name : 'Ismeretlen orvos';
  }

  cancelAppointment(appointmentId: string | undefined): void {
    if (!appointmentId) return;
    
    if (confirm('Biztosan törölni szeretné ezt az időpontot?')) {
      this.appointmentService.cancelAppointment(appointmentId).subscribe({
        next: () => {
          this.loadAppointments();
          this.snackBar.open('Időpont sikeresen törölve', 'Bezárás', {
            duration: 3000
          });
        },
        error: (error) => {
          console.error('Hiba az időpont törlésekor:', error);
          this.snackBar.open('Hiba az időpont törlésekor', 'Bezárás', {
            duration: 3000
          });
        }
      });
    }
  }

  deleteAllAppointments(): void {
    if (this.appointments.length === 0) return;
    
    if (confirm('Biztosan törölni szeretné az összes időpontot? Ez a művelet nem vonható vissza!')) {
      this.appointmentService.deleteAllAppointments().subscribe({
        next: () => {
          this.loadAppointments();
          this.snackBar.open('Minden időpont sikeresen törölve', 'Bezárás', {
            duration: 3000
          });
        },
        error: (error) => {
          console.error('Hiba az időpontok törlésekor:', error);
          this.snackBar.open('Hiba az időpontok törlésekor', 'Bezárás', {
            duration: 3000
          });
        }
      });
    }
  }
}
