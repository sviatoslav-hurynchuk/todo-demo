import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  // Reactive state management via Signals
  private accessTokenSignal = signal<string | null>(null);
  private userSignal = signal<User | null>(null);

  readonly accessToken = this.accessTokenSignal.asReadonly();
  readonly currentUser = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.accessTokenSignal());

  register(dto: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, dto, { withCredentials: true }).pipe(
      tap(response => this.setAuthState(response))
    );
  }

  login(dto: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, dto, { withCredentials: true }).pipe(
      tap(response => this.setAuthState(response))
    );
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh-token`, {}, { withCredentials: true }).pipe(
      tap(response => this.setAuthState(response)),
      catchError(err => {
        this.clearAuthState();
        return throwError(() => err);
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/revoke-token`, {}, { withCredentials: true }).pipe(
      tap(() => this.clearAuthState()),
      catchError(() => {
        this.clearAuthState();
        return [];
      })
    );
  }

  private setAuthState(response: AuthResponse): void {
    this.accessTokenSignal.set(response.accessToken);
    this.userSignal.set({
      username: response.username,
      email: response.email
    });
  }

  private clearAuthState(): void {
    this.accessTokenSignal.set(null);
    this.userSignal.set(null);
  }
}
