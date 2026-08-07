import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.accessToken();

  // Centralized configuration: withCredentials: true + Bearer Token for all API requests
  let clonedReq = req.clone({
    withCredentials: true,
    setHeaders: token && !req.url.includes('/api/auth/') ? { Authorization: `Bearer ${token}` } : {}
  });

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Automatic token refresh on 401 Unauthorized
      if (error.status === 401 && !req.url.includes('/api/auth/')) {
        return authService.refreshToken().pipe(
          switchMap(authResponse => {
            const newReq = req.clone({
              withCredentials: true,
              setHeaders: {
                Authorization: `Bearer ${authResponse.accessToken}`
              }
            });
            return next(newReq);
          }),
          catchError(refreshError => {
            router.navigate(['/login']);
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
