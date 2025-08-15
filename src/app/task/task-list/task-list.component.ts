import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TaskService } from '../task.service';
import { AuthService } from '../../auth/auth.service';
import { NotificationService } from '../../notification/notification.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit, OnDestroy {
  tasks: Task[] = [];
  error = '';
  statusOptions = ['To Do', 'In Progress', 'Done'];
  loading = false;
  loadingId: string | null = null;
  completedTaskIds = new Set<string>();
  overdueTaskIds = new Set<string>();
  timerInterval: any;
  confirmationTask: Task | null = null;
  confirmationStatus: string = '';
  confirmationMessage: string = '';
  confirmationActionText: string = '';

  constructor(
    private taskService: TaskService,
    public auth: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.refresh();
    this.timerInterval = setInterval(() => {
      this.checkOverdues();
      this.tasks = [...this.tasks];
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  refresh(): void {
    this.loading = true;
    this.taskService.getTasks().subscribe({
      next: (res: Task[]) => {
        this.tasks = res;
        this.completedTaskIds.clear();
        this.overdueTaskIds.clear();
        res.forEach(task => {
          if (task.status === 'Done') {
            this.completedTaskIds.add(task._id || '');
          }
          // If backend has already marked as Overdue, reflect it in UI
          if (task.status === 'Overdue') {
            this.overdueTaskIds.add(task._id || '');
          }
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to fetch tasks';
        this.loading = false;
      }
    });
  }

  // Detect newly overdue tasks and notify backend once
  checkOverdues(): void {
    const now = new Date().getTime();
    this.tasks.forEach(task => {
      const id = task._id || '';
      const isCompleted = this.completedTaskIds.has(id);
      const deadlineMs = task.deadline ? new Date(task.deadline).getTime() : Infinity;
      const isOverdueNow = !isCompleted && deadlineMs < now;

      if (isOverdueNow && !this.overdueTaskIds.has(id)) {
        this.overdueTaskIds.add(id);
        // Tell backend to mark overdue and send email; ignore response here
        this.taskService.markOverdue(id).subscribe({
          next: () => {
            // Optionally refresh to pull backend 'Overdue' status
            this.refresh();
          },
          error: () => {
            // Silent fail to avoid spamming user alerts
          }
        });
      }
    });
  }

  canEditStatus(task: Task): boolean {
    return (
      this.auth.getRole() === 'Employee' &&
      task.assigned_to === this.auth.getEmployeeId() &&
      task.status !== 'Done' &&
      !this.overdueTaskIds.has(task._id || '')
    );
  }

  onStatusChange(task: Task, event: Event): void {
    const newStatus = (event.target as HTMLSelectElement).value;
    if (newStatus === 'Done') {
      this.confirmationMessage = 'Are you sure you completed the task?';
      this.confirmationActionText = 'Submit';
    } else if (newStatus === 'In Progress') {
      this.confirmationMessage = 'The task is in progress. Continue?';
      this.confirmationActionText = 'Continue';
    } else {
      this.updateStatus(task, newStatus);
      return;
    }
    this.confirmationTask = task;
    this.confirmationStatus = newStatus;
  }

  cancelConfirmation(): void {
    this.confirmationTask = null;
    this.confirmationStatus = '';
  }

  confirmStatusChange(): void {
    if (this.confirmationTask) {
      this.updateStatus(this.confirmationTask, this.confirmationStatus);
    }
    this.cancelConfirmation();
  }

  updateStatus(task: Task, status: string): void {
    this.loadingId = task._id || null;
    if (status === 'Done') {
      this.taskService.completeTask(task._id || '').subscribe({
        next: () => {
          this.loadingId = null;
          this.completedTaskIds.add(task._id || '');
          task.status = 'Done';
          alert('Task completion notified!');
          this.notificationService.push(
            `New notification from ${this.auth.getEmployeeId()} - ${this.auth.getUsername()}: Completed "${task.title}"`
          );
          this.refresh();
        },
        error: () => {
          this.loadingId = null;
          alert('Failed to complete task!');
        }
      });
      return;
    }
    this.taskService.updateTask(task._id || '', { status }).subscribe({
      next: () => {
        this.loadingId = null;
        if (status === 'Done') {
          this.completedTaskIds.add(task._id || '');
        }
        this.refresh();
      },
      error: () => {
        this.loadingId = null;
        alert('Failed to update status!');
      }
    });
  }

  canUpdateDelete(): boolean {
    const role = this.auth.getRole();
    return role === 'Admin' || role === 'Manager';
  }

  updateTask(task: Task): void {
    this.router.navigate(['/tasks', task._id]);
  }

  deleteTask(task: Task): void {
    if (confirm(`Delete task "${task.title}"?`)) {
      this.loadingId = task._id || null;
      this.taskService.deleteTask(task._id || '').subscribe({
        next: () => {
          this.loadingId = null;
          this.refresh();
        },
        error: () => {
          this.loadingId = null;
          alert('Delete failed!');
        }
      });
    }
  }

  completeTask(task: Task): void {
    this.loadingId = task._id || null;
    this.taskService.completeTask(task._id || '').subscribe({
      next: () => {
        this.loadingId = null;
        this.completedTaskIds.add(task._id || '');
        task.status = 'Done';
        alert('Task completion notified!');
        this.notificationService.push(
          `New notification from ${this.auth.getEmployeeId()} - ${this.auth.getUsername()}: Completed "${task.title}"`
        );
      },
      error: () => {
        this.loadingId = null;
        alert('Failed to complete task!');
      }
    });
  }

  private calculateTimeLeft(deadlineStr: string): string {
    if (!deadlineStr) return '';
    const deadline = new Date(deadlineStr);
    const now = new Date();
    const ms = deadline.getTime() - now.getTime();
    if (ms <= 0) return 'Overdue';
    const hours = Math.floor(ms / (1000 * 3600));
    const mins = Math.floor((ms / (1000 * 60)) % 60);
    const secs = Math.floor((ms / 1000) % 60);
    return `${hours}h ${mins}m ${secs}s left`;
  }

  getTimeLeft(task: Task): string {
    if (this.completedTaskIds.has(task._id || '')) {
      return 'Completed';
    }
    return this.calculateTimeLeft(task.deadline);
  }

  isDeadlinePassed(deadlineStr: string): boolean {
    if (!deadlineStr) return false;
    const deadline = new Date(deadlineStr);
    return new Date().getTime() > deadline.getTime();
  }
}
