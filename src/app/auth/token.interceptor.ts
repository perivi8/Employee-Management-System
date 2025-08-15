import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getToken();
    let authReq = req;

    if (token) {
      authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 422) {
          return this.handle401(authReq, next);
        }
        return throwError(() => error);
      })
    );
  }

  private handle401(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refresh = this.auth.getRefreshToken();
      if (!refresh) {
        this.isRefreshing = false;
        this.auth.logout();
        return throwError(() => new Error('No refresh token'));
      }

      return this.auth.refreshToken().pipe(
        switchMap((res) => {
          this.isRefreshing = false;
          const newToken = res.token;
          this.auth.setToken(newToken, this.auth.getRole() || '', this.auth.getUsername() || '', this.auth.getEmployeeId() || '');
          this.refreshTokenSubject.next(newToken);
          const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } });
          return next.handle(retryReq);
        }),
        catchError(err => {
          this.isRefreshing = false;
          this.auth.logout();
          return throwError(() => err);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap((token) => {
          const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
          return next.handle(retryReq);
        })
      );
    }
  }
}
