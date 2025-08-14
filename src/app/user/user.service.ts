import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable()
export class UserService {
  constructor(private http: HttpClient) {}

  getUsers() { return this.http.get(`${environment.apiUrl}/users/`); }

  deleteUser(id: string) {
    return this.http.delete(`${environment.apiUrl}/users/${id}`);
  }

  updateUser(id: string, update: any) {
    return this.http.put(`${environment.apiUrl}/users/${id}`, update);
  }
}
