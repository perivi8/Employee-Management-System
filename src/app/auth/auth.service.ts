import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class AuthService {
  private tokenKey = 'auth_token';
  private roleKey = 'user_role';
  private usernameKey = 'username';
  private empIdKey = 'employee_id';
  private _isAuthenticated = new BehaviorSubject<boolean>(!!localStorage.getItem(this.tokenKey));
  public isAuthenticated$ = this._isAuthenticated.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<{ token: string, role: string, username: string, employee_id: string }>(
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

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
    localStorage.removeItem(this.usernameKey);
    localStorage.removeItem(this.empIdKey);
    this._isAuthenticated.next(false);
  }

  setToken(token: string, role: string, username: string, employeeId: string) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.roleKey, role);
    localStorage.setItem(this.usernameKey, username);
    if (employeeId) localStorage.setItem(this.empIdKey, employeeId);
    this._isAuthenticated.next(true);
  }

  getToken(): string | null { return localStorage.getItem(this.tokenKey); }
  getRole(): string | null { return localStorage.getItem(this.roleKey); }
  getUsername(): string | null { return localStorage.getItem(this.usernameKey); }
  getEmployeeId(): string | null { return localStorage.getItem(this.empIdKey); }
}
