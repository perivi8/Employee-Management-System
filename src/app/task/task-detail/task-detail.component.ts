import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../task.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.scss']
})
export class TaskDetailComponent implements OnInit {
  task: any = null;
  error = '';
  editing = false;
  updateMsg = '';
  canEditStatus = false;
  loading = false; // Added for update button

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.taskService.getTask(id).subscribe({
      next: (res: any) => {
        this.task = res;
        this.canEditStatus = this.auth.getRole() === 'Employee' && this.task.assigned_to === this.auth.getEmployeeId();
      },
      error: () => this.error = 'Task not found'
    });
  }

  enableEdit() {
    this.editing = true;
  }

  updateTask() {
    if (this.task && this.task._id && !this.loading) {
      this.loading = true;
      const id = this.task._id;
      const update = {
        title: this.task.title,
        description: this.task.description,
        assigned_to: this.task.assigned_to,
        priority: this.task.priority,
        status: this.task.status,
        deadline: this.task.deadline
      };
      this.taskService.updateTask(id, update).subscribe({
        next: () => {
          this.updateMsg = 'Task updated!';
          this.editing = false;
          this.loading = false;
        },
        error: () => {
          this.error = 'Update failed';
          this.loading = false;
        }
      });
    }
  }

  updateStatus(newStatus: string) {
    if (!this.task || !this.task._id || this.loading) return;

    if (this.canEditStatus) {
      this.loading = true;
      if (newStatus === 'Done') {
        this.taskService.completeTask(this.task._id).subscribe({
          next: () => {
            this.updateMsg = 'Submitted (Done) and managers notified!';
            this.loading = false;
          },
          error: () => {
            this.error = 'Failed to submit task';
            this.loading = false;
          }
        });
        return;
      }

      this.taskService.updateTask(this.task._id, { status: newStatus }).subscribe({
        next: () => {
          this.updateMsg = 'Status updated!';
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to update status';
          this.loading = false;
        }
      });
    }
  }
}