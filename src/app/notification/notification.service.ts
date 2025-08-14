import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class NotificationService {
  private notifications = new BehaviorSubject<string[]>([]);
  notifications$ = this.notifications.asObservable();

  private hasNew = new BehaviorSubject<boolean>(false);
  hasNew$ = this.hasNew.asObservable();

  private storageKey = '';

  constructor() {}

  /**
   * Call this when a user logs in
   */
  initForUser(userId: string) {
    this.storageKey = `notifications_${userId}`;
    const saved = localStorage.getItem(this.storageKey);
    const list: string[] = saved ? JSON.parse(saved) : [];
    this.notifications.next(list);
    this.hasNew.next(list.length > 0);
  }

  /**
   * Add a new notification for this user
   */
  push(message: string) {
    if (!this.storageKey) return;
    const list = [...this.notifications.value, message];
    this.notifications.next(list);
    localStorage.setItem(this.storageKey, JSON.stringify(list));
    this.hasNew.next(true); // mark red dot
  }

  /**
   * Mark notifications seen (keeps them but removes red dot)
   */
  markAsSeen() {
    if (!this.storageKey) return;
    this.hasNew.next(false);
  }

  /**
   * Clear this user's notifications only
   */
  clear() {
    if (!this.storageKey) return;
    this.notifications.next([]);
    localStorage.removeItem(this.storageKey);
    this.hasNew.next(false);
  }
}
