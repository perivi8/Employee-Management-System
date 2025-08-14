import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Task } from '../models/task.model';  // <-- Make sure this exists and is correctly defined

@Injectable()
export class TaskService {
  constructor(private http: HttpClient) {}

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${environment.apiUrl}/tasks/`);
  }

  getTask(id: string): Observable<Task> {
    return this.http.get<Task>(`${environment.apiUrl}/tasks/${id}`);
  }

  createTask(data: any): Observable<{ msg: string }> {
    return this.http.post<{ msg: string }>(`${environment.apiUrl}/tasks/create`, data);
  }

  updateTask(id: string, data: Partial<Task>): Observable<{ msg: string }> {
    return this.http.put<{ msg: string }>(`${environment.apiUrl}/tasks/update/${id}`, data);
  }

  deleteTask(id: string): Observable<{ msg: string }> {
    return this.http.delete<{ msg: string }>(`${environment.apiUrl}/tasks/delete/${id}`);
  }

  completeTask(id: string): Observable<{ msg: string }> {
    return this.http.post<{ msg: string }>(`${environment.apiUrl}/tasks/complete/${id}`, {});
  }
}
