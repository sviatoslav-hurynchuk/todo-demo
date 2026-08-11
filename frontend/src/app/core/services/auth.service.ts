import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, shareReplay, finalize, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/auth`;
  private refreshTokenObservable$: Observable<AuthResponse> | null = null;

  // Reactive state management via Signals
  private accessTokenSignal = signal<string | null>(null);
  private userSignal = signal<User | null>(null);

  readonly accessToken = this.accessTokenSignal.asReadonly();
  readonly currentUser = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.accessTokenSignal());

  register(dto: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, dto).pipe(
      tap(response => this.setAuthState(response))
    );
  }

  login(dto: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, dto).pipe(
      tap(response => this.setAuthState(response))
    );
  }

  refreshToken(): Observable<AuthResponse> {
    if (this.refreshTokenObservable$) {
      return this.refreshTokenObservable$;
    }

    this.refreshTokenObservable$ = this.http.post<AuthResponse>(`${this.apiUrl}/refresh-token`, {}).pipe(
      tap(response => this.setAuthState(response)),
      shareReplay(1),
      catchError(err => {
        this.clearAuthState();
        return throwError(() => err);
      }),
      finalize(() => {
        this.refreshTokenObservable$ = null;
      })
    );

    return this.refreshTokenObservable$;
  }

  logout(): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiUrl}/revoke-token`, {}).pipe(
      tap(() => {
        this.clearAuthState();
        this.router.navigate(['/login']);
      }),
      catchError(() => {
        this.clearAuthState();
        this.router.navigate(['/login']);
        return of(undefined);
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
