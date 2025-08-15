import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'auth_token';
  private refreshKey = 'refresh_token';
  private roleKey = 'user_role';
  private usernameKey = 'username';
  private empIdKey = 'employee_id';

  private _isAuthenticated = new BehaviorSubject<boolean>(!!localStorage.getItem(this.tokenKey));
  public isAuthenticated$ = this._isAuthenticated.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<{ token: string, refresh_token: string, role: string, username: string, employee_id: string }>(
      `${environment.apiUrl}/users/login`, { email, password }
    );
  }

  register(username: string, email: string, password: string, role: string = '') {
    return this.http.post(`${environment.apiUrl}/users/register`, { username, email, password, role });
  }

  verifyEmail(email: string, code: string) {
    return this.http.post(`${environment.apiUrl}/users/verify-email`, { email, code });
  }

  resendCode(email: string) {
    return this.http.post(`${environment.apiUrl}/users/resend-code`, { email });
  }

  refreshToken(): Observable<{ token: string }> {
    const refresh = this.getRefreshToken();
    return this.http.post<{ token: string }>(`${environment.apiUrl}/users/refresh`, {}, {
      headers: { Authorization: `Bearer ${refresh}` }
    });
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshKey);
    localStorage.removeItem(this.roleKey);
    localStorage.removeItem(this.usernameKey);
    localStorage.removeItem(this.empIdKey);
    this._isAuthenticated.next(false);
  }

  setToken(token: string, role: string, username: string, employeeId: string, refreshToken?: string) {
    localStorage.setItem(this.tokenKey, token);
    if (refreshToken) localStorage.setItem(this.refreshKey, refreshToken);
    localStorage.setItem(this.roleKey, role);
    localStorage.setItem(this.usernameKey, username);
    if (employeeId) localStorage.setItem(this.empIdKey, employeeId);
    this._isAuthenticated.next(true);
  }

  getToken(): string | null { return localStorage.getItem(this.tokenKey); }
  getRefreshToken(): string | null { return localStorage.getItem(this.refreshKey); }
  getRole(): string | null { return localStorage.getItem(this.roleKey); }
  getUsername(): string | null { return localStorage.getItem(this.usernameKey); }
  getEmployeeId(): string | null { return localStorage.getItem(this.empIdKey); }
}
