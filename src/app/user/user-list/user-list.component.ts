import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  users: any[] = [];
  error = '';
  editingId: string | null = null;
  editUser = { username: '', email: '', role: '' };
  updateMsg = '';
  loading = false; // Global loading for fetching users
  loadingId: string | null = null; // Row-specific loading
  deleteConfirmationUser: any | null = null; // For delete confirmation popup

  constructor(private userService: UserService, public auth: AuthService) {}

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (res: any) => {
        this.users = res;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to fetch users';
        this.loading = false;
      }
    });
  }

  canEditOrDelete(): boolean {
    const role = this.auth.getRole();
    return role === 'Admin' || role === 'Manager';
  }

  startEdit(user: any) {
    this.editingId = user._id;
    this.editUser = { username: user.username, email: user.email, role: user.role };
    this.updateMsg = '';
  }

  getEditingUser() {
    return this.users.find(u => u._id === this.editingId);
  }

  saveEdit(user: any) {
    if (user && !this.loadingId) {
      this.loadingId = user._id;
      this.userService.updateUser(user._id, this.editUser).subscribe({
        next: () => {
          this.updateMsg = 'User updated successfully!';
          this.editingId = null;
          this.loadingId = null;
          this.refresh();
        },
        error: () => {
          this.updateMsg = 'Update failed';
          this.loadingId = null;
        }
      });
    }
  }

  cancelEdit() {
    this.editingId = null;
    this.updateMsg = '';
  }

  deleteUser(user: any) {
    this.deleteConfirmationUser = user; // Show styled popup instead of confirm
  }

  confirmDelete() {
    if (this.deleteConfirmationUser && !this.loadingId) {
      this.loadingId = this.deleteConfirmationUser._id;
      this.userService.deleteUser(this.deleteConfirmationUser._id).subscribe({
        next: () => {
          this.updateMsg = 'User deleted successfully!';
          this.loadingId = null;
          this.deleteConfirmationUser = null;
          this.refresh();
        },
        error: () => {
          this.updateMsg = 'Delete failed!';
          this.loadingId = null;
          this.deleteConfirmationUser = null;
        }
      });
    }
  }

  cancelDelete() {
    this.deleteConfirmationUser = null;
  }
}