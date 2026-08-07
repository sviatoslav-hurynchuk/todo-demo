import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Strict API boundary check: do not attach credentials or tokens to external third-party URLs
  const isApiRequest = req.url.startsWith(environment.apiUrl);
  if (!isApiRequest) {
    return next(req);
  }

  const token = authService.accessToken();
  const isAuthEndpoint = req.url.startsWith(`${environment.apiUrl}/auth`);

  let clonedReq = req.clone({
    withCredentials: true,
    setHeaders: token && !isAuthEndpoint ? { Authorization: `Bearer ${token}` } : {}
  });

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Coalesced automatic token refresh on 401 Unauthorized for API requests
      if (error.status === 401 && !isAuthEndpoint) {
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
