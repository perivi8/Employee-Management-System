import { Component, Output, EventEmitter, HostListener, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../notification/notification.service';
import { Observable, Subscription, interval } from 'rxjs';
import { EmailNotificationService, EmailNotification } from '../../notification/email-notification.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  showMenu = false;
  hasNew$: Observable<boolean>;

  @Output() toggleSidebar: EventEmitter<void> = new EventEmitter();
  sidebarCollapsed = false;

  showMailDropdown = false;
  emailNotifications: EmailNotification[] = [];
  unreadMailCount = 0;

  private pollSub?: Subscription;
  loggingOut = false;

  constructor(
    public auth: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private emailService: EmailNotificationService
  ) {
    this.hasNew$ = this.notificationService.hasNew$;
  }

  ngOnInit(): void {
    this.loadEmails();
    // Poll every 30s for new emails
    this.pollSub = interval(30000).subscribe(() => this.loadEmails());
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  logout() {
    if (this.loggingOut) return;
    if (confirm('Are you sure about Logout?')) {
      this.loggingOut = true;
      setTimeout(() => {
        this.auth.logout();
        this.router.navigate(['/login']);
        this.loggingOut = false;
      }, 2000);
    }
  }

  markNotificationsSeen() {
    this.notificationService.markAsSeen();
  }

  triggerSidebarToggle() {
    this.toggleSidebar.emit();
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  loadEmails(): void {
    this.emailService.getEmailNotifications().subscribe((list) => {
      this.emailNotifications = list || [];
      this.unreadMailCount = this.emailNotifications.filter(m => !m.read).length;
    });
  }

  toggleMailDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.showMailDropdown = !this.showMailDropdown;

    if (this.showMailDropdown) {
      const unreadIds = this.emailNotifications.filter(m => !m.read).map(m => m._id);
      if (unreadIds.length) {
        this.emailService.markAsRead(unreadIds).subscribe(() => {
          this.emailNotifications = this.emailNotifications.map(m =>
            unreadIds.includes(m._id) ? { ...m, read: true } : m
          );
          this.unreadMailCount = 0;
        });
      }
    }
  }

  toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.showMenu = !this.showMenu;
  }

  refreshEmails(event: MouseEvent): void {
    event.stopPropagation();
    this.loadEmails();
  }

  dismissEmail(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.emailNotifications = this.emailNotifications.filter(m => m._id !== id);
    this.unreadMailCount = this.emailNotifications.filter(m => !m.read).length;
    this.emailService.removeEmailNotification(id).subscribe({
      next: () => {},
      error: (err) => {
        console.error('Failed to remove email notification:', err);
      }
    });
  }

  @HostListener('document:click')
  onDocClick() {
    this.showMailDropdown = false;
    this.showMenu = false;
  }

  statusClass(status?: string): string {
    switch ((status || '').toLowerCase()) {
      case 'done': return 'chip-done';
      case 'in progress': return 'chip-progress';
      case 'assigned': return 'chip-assigned';
      default: return 'chip-info';
    }
  }
}
