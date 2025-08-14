import { Component, Input } from '@angular/core';
import { NotificationService } from '../../notification/notification.service';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  hasNew$: Observable<boolean>;
  @Input() collapsed = false;

  constructor(
    private notificationService: NotificationService,
    public auth: AuthService
  ) {
    this.hasNew$ = this.notificationService.hasNew$;
  }

  markNotificationsSeen() {
    this.notificationService.markAsSeen();
  }
}
