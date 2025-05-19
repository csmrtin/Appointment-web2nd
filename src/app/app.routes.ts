import { Routes } from '@angular/router';
import { DoctorComponent } from './doctor/doctor.component';
import { AppointmentComponent } from './appointment/appointment.component';
import { BookingFormComponent } from './booking-form/booking-form.component';
import { AuthGuard } from './auth/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { RegistrationComponent } from './auth/registration/registration.component';
import { UserProfileComponent } from './user-profile/user-profile.component';

export const routes: Routes = [
  { path: '', redirectTo: '/appointments', pathMatch: 'full' },
  { path: 'doctors', component: DoctorComponent },
  { path: 'appointments', component: AppointmentComponent, canActivate: [AuthGuard] },
  { path: 'book', component: BookingFormComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent },
  { path: 'profile', component: UserProfileComponent, canActivate: [AuthGuard] },
];
