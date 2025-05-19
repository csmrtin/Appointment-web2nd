import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, from } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
  UserCredential
} from 'firebase/auth';
import { auth } from '../firebase.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isLoggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn$: Observable<boolean> = this._isLoggedIn.asObservable();
  private currentUser: User | null = null;

  constructor() {
    // Ellenőrizzük a bejelentkezési állapotot az alkalmazás indításakor
    auth.onAuthStateChanged((user: User | null) => {
      this.currentUser = user;
      this._isLoggedIn.next(!!user);
    });
  }

  login(email: string, password: string): Observable<boolean> {
    return from(signInWithEmailAndPassword(auth, email, password)).pipe(
      map((userCredential: UserCredential) => {
        this.currentUser = userCredential.user;
        return true;
      }),
      catchError((error) => {
        console.error('Login error:', error);
        return from(Promise.resolve(false));
      })
    );
  }

  register(email: string, password: string): Observable<boolean> {
    return from(createUserWithEmailAndPassword(auth, email, password)).pipe(
      map((userCredential: UserCredential) => {
        this.currentUser = userCredential.user;
        return true;
      }),
      catchError((error) => {
        console.error('Registration error:', error);
        return from(Promise.resolve(false));
      })
    );
  }

  logout(): Observable<void> {
    return from(signOut(auth)).pipe(
      tap(() => {
        this.currentUser = null;
        this._isLoggedIn.next(false);
      })
    );
  }

  checkLoginStatus(): boolean {
    return !!this.currentUser;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }
} 