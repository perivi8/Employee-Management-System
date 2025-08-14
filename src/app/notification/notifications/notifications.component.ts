import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  notifications: string[] = [];

  constructor(private notify: NotificationService) {}

  ngOnInit() {
    this.notify.notifications$.subscribe((n) => (this.notifications = n));
  }

  clearMessages() {
    this.notify.clear();
  }
}
