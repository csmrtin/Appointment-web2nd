import { Injectable } from '@angular/core';
import { Observable, from, map, of, switchMap, take } from 'rxjs';
import { delay } from 'rxjs/operators';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  Timestamp,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from './firebase.config';
import { Appointment } from './shared/models';
import { AuthService } from './auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private readonly appointmentsCollection = 'appointments';

  constructor(private authService: AuthService) {}

  createAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Observable<string> {
    return this.authService.isLoggedIn$.pipe(
      take(1),
      switchMap(isLoggedIn => {
        if (!isLoggedIn || !auth.currentUser?.uid) {
          throw new Error('User not authenticated');
        }

        const appointmentData = {
          ...appointment,
          date: Timestamp.fromDate(appointment.date),
          patientId: auth.currentUser.uid,
          status: 'pending',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };

        console.log('Creating appointment with data:', appointmentData);

        return from(addDoc(collection(db, this.appointmentsCollection), appointmentData)).pipe(
          map(docRef => docRef.id)
        );
      })
    );
  }

  getAppointments(): Observable<Appointment[]> {
    return this.authService.isLoggedIn$.pipe(
      take(1),
      switchMap(isLoggedIn => {
        if (!isLoggedIn || !auth.currentUser?.uid) {
          return of([]);
        }

        const q = query(
          collection(db, this.appointmentsCollection),
          where('patientId', '==', auth.currentUser.uid)
        );

        return from(getDocs(q)).pipe(
          map(snapshot => 
            snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              date: (doc.data()['date'] as Timestamp).toDate(),
              createdAt: (doc.data()['createdAt'] as Timestamp).toDate(),
              updatedAt: (doc.data()['updatedAt'] as Timestamp).toDate()
            } as Appointment))
          )
        );
      })
    );
  }

  updateAppointment(id: string, appointment: Partial<Appointment>): Observable<void> {
    return this.authService.isLoggedIn$.pipe(
      take(1),
      switchMap(isLoggedIn => {
        if (!isLoggedIn || !auth.currentUser?.uid) {
          throw new Error('User not authenticated');
        }

        const appointmentRef = doc(db, this.appointmentsCollection, id);
        const updateData = {
          ...appointment,
          updatedAt: Timestamp.now()
        };

        return from(updateDoc(appointmentRef, updateData));
      })
    );
  }

  deleteAppointment(id: string): Observable<void> {
    return this.authService.isLoggedIn$.pipe(
      take(1),
      switchMap(isLoggedIn => {
        if (!isLoggedIn || !auth.currentUser?.uid) {
          throw new Error('User not authenticated');
        }

        const appointmentRef = doc(db, this.appointmentsCollection, id);
        return from(deleteDoc(appointmentRef));
      })
    );
  }

  cancelAppointment(id: string): Observable<void> {
    return this.authService.isLoggedIn$.pipe(
      take(1),
      switchMap(isLoggedIn => {
        if (!isLoggedIn || !auth.currentUser?.uid) {
          throw new Error('User not authenticated');
        }

        const appointmentRef = doc(db, this.appointmentsCollection, id);
        return from(deleteDoc(appointmentRef));
      })
    );
  }

  // Komplex lekérdezések

  getAppointmentsByDoctorId(doctorId: string): Observable<Appointment[]> {
    const q = query(
      collection(db, this.appointmentsCollection),
      where('doctorId', '==', doctorId)
    );

    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: (doc.data()['date'] as Timestamp).toDate(),
          createdAt: (doc.data()['createdAt'] as Timestamp).toDate(),
          updatedAt: (doc.data()['updatedAt'] as Timestamp).toDate()
        } as Appointment))
      )
    );
  }

  getAppointmentsByDate(date: Date): Observable<Appointment[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const q = query(
      collection(db, this.appointmentsCollection),
      where('date', '>=', Timestamp.fromDate(startOfDay)),
      where('date', '<=', Timestamp.fromDate(endOfDay))
    );

    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: (doc.data()['date'] as Timestamp).toDate(),
          createdAt: (doc.data()['createdAt'] as Timestamp).toDate(),
          updatedAt: (doc.data()['updatedAt'] as Timestamp).toDate()
        } as Appointment))
      )
    );
  }

  getAppointmentsSortedByDateTime(): Observable<Appointment[]> {
    const q = query(
      collection(db, this.appointmentsCollection),
      orderBy('date', 'asc'),
      orderBy('time', 'asc')
    );

    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: (doc.data()['date'] as Timestamp).toDate(),
          createdAt: (doc.data()['createdAt'] as Timestamp).toDate(),
          updatedAt: (doc.data()['updatedAt'] as Timestamp).toDate()
        } as Appointment))
      )
    );
  }

  getAppointmentsPaged(page: number, pageSize: number, lastDoc?: QueryDocumentSnapshot): Observable<{
    appointments: Appointment[];
    lastDoc: QueryDocumentSnapshot | null;
  }> {
    let q = query(
      collection(db, this.appointmentsCollection),
      orderBy('date', 'asc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    return from(getDocs(q)).pipe(
      map(snapshot => ({
        appointments: snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: (doc.data()['date'] as Timestamp).toDate(),
          createdAt: (doc.data()['createdAt'] as Timestamp).toDate(),
          updatedAt: (doc.data()['updatedAt'] as Timestamp).toDate()
        } as Appointment)),
        lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
      }))
    );
  }

  deleteAllAppointments(): Observable<void> {
    return this.authService.isLoggedIn$.pipe(
      take(1),
      switchMap(isLoggedIn => {
        if (!isLoggedIn || !auth.currentUser?.uid) {
          throw new Error('User not authenticated');
        }

        // Lekérjük az összes időpontot a bejelentkezett felhasználóhoz
        const q = query(
          collection(db, this.appointmentsCollection),
          where('patientId', '==', auth.currentUser.uid)
        );

        return from(getDocs(q)).pipe(
          switchMap(snapshot => {
            // Törlési műveletek batch-ben
            const batch = writeBatch(db);
            snapshot.docs.forEach(doc => {
              batch.delete(doc.ref);
            });
            return from(batch.commit());
          })
        );
      })
    );
  }
}
