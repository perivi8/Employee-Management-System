import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface EmailNotification {
  _id: string;
  from: string;
  recipient: string;
  subject: string;
  message: string;
  read: boolean;
  timestamp: string;
  status?: 'In Progress' | 'Done' | 'Assigned' | string;
  title?: string;
  task_id?: string;
  employee_id?: string;
  username?: string;
  meta?: any;
}

@Injectable({ providedIn: 'root' })
export class EmailNotificationService {
  constructor(private http: HttpClient) {}

  getEmailNotifications(): Observable<EmailNotification[]> {
    return this.http.get<EmailNotification[]>(`${environment.apiUrl}/notifications/emails/`);
  }

  markAsRead(ids: string[]): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${environment.apiUrl}/notifications/emails/mark-read`, { ids });
  }

  removeEmailNotification(id: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${environment.apiUrl}/notifications/emails/remove`, { id });
  }
}
