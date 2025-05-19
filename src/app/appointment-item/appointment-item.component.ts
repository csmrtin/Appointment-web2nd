import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Appointment } from '../shared/models';
import { DateFormatPipe } from '../shared/pipes/date-format.pipe';
import { TruncatePipe } from '../shared/pipes/truncate.pipe';

@Component({
  selector: 'app-appointment-item',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    DateFormatPipe,
    TruncatePipe
  ],
  templateUrl: './appointment-item.component.html',
  styleUrl: './appointment-item.component.scss'
})
export class AppointmentItemComponent {
  @Input() appointment!: Appointment;
  @Input() doctorName: string = '';
  @Output() cancelAppointment = new EventEmitter<string>();
  @Output() deleteAppointment = new EventEmitter<string>();

  onCancel(): void {
    if (this.appointment.id) {
      this.cancelAppointment.emit(this.appointment.id);
    }
  }

  onDelete(): void {
    if (this.appointment.id) {
      this.deleteAppointment.emit(this.appointment.id);
    }
  }
}
