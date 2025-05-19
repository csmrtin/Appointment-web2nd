import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

// Egyedi validátor a jelszó megerősítéshez
function passwordMatchValidator(control: AbstractControl): {[key: string]: boolean} | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { 'passwordMismatch': true };
  }
  return null;
}

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss'
})
export class RegistrationComponent implements OnInit {
  registrationForm!: FormGroup;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.registrationForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: passwordMatchValidator });
  }

  onSubmit(): void {
    if (this.registrationForm.valid) {
      const { email, password } = this.registrationForm.value;
      this.errorMessage = '';

      this.authService.register(email, password).subscribe({
        next: (success) => {
          if (success) {
            console.log('Registration successful!');
            this.router.navigate(['/login']);
          } else {
            this.errorMessage = 'A regisztráció sikertelen volt';
          }
        },
        error: (error) => {
          console.error('Registration error:', error);
          if (error.code === 'auth/email-already-in-use') {
            this.errorMessage = 'Ez az email cím már használatban van';
          } else {
            this.errorMessage = 'Hiba történt a regisztráció során';
          }
        }
      });
    }
  }
}
