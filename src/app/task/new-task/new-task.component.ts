import { Component, OnInit } from '@angular/core';
import { TaskService } from '../task.service';
import { UserService } from '../../user/user.service';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { NotificationService } from '../../notification/notification.service';

@Component({
  selector: 'app-new-task',
  templateUrl: './new-task.component.html',
  styleUrls: ['./new-task.component.scss']
})
export class NewTaskComponent implements OnInit {
  title = '';
  description = '';
  priority = 'Medium';
  status = 'To Do';
  deadline = '';
  error = '';
  success = '';
  loading = false;

  employeeList: any[] = [];
  assigned_to: string[] = [];

  constructor(
    private taskService: TaskService,
    private userService: UserService,
    private router: Router,
    public auth: AuthService,
    private notifService: NotificationService
  ) {}

  ngOnInit() {
    this.userService.getUsers().subscribe((res) => {
      this.employeeList = (res as any[]).filter(u => u.role === 'Employee');
    });
  }

  onSubmit() {
    if (this.loading) return;

    if (this.auth.getRole() !== 'Manager' && this.auth.getRole() !== 'Admin') {
      this.error = 'Only Manager and Admin can create tasks!';
      return;
    }

    if (!this.title || !this.description || !this.deadline || this.assigned_to.length === 0) {
      this.error = 'Fill all fields and select at least one employee!';
      return;
    }

    this.error = '';
    this.success = '';
    this.loading = true;

    this.taskService.createTask({
      title: this.title,
      description: this.description,
      assigned_to: this.assigned_to,
      priority: this.priority,
      status: this.status,
      deadline: this.deadline
    }).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Task created!';
        
        this.assigned_to.forEach(empId => {
          const emp = this.employeeList.find(e => e.employee_id === empId);
          if (emp) {
            this.notifService.push(
              `New task "${this.title}" assigned to you by ${this.auth.getRole()} - ${this.auth.getUsername()}`
            );
          }
        });

        setTimeout(() => this.router.navigate(['/tasks']), 1000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.msg || 'Failed to create task';
      }
    });
  }
}