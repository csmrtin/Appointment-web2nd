import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth/auth.service';
import { Observable } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    MatMenuModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Időpontfoglaló';
  isLoggedIn$: Observable<boolean>;

  constructor(private authService: AuthService) {
    console.log('AppComponent constructor');
    this.isLoggedIn$ = this.authService.isLoggedIn$.pipe(
      tap(status => console.log('Login status changed:', status))
    );
  }

  logout(): void {
    this.authService.logout();
  }
}
