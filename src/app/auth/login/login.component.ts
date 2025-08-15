import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  showOverlay = false;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    if (this.showOverlay) return;
    this.error = '';
    this.showOverlay = true;

    // Expecting login response to include: token, refresh_token, role, username, employee_id
    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        // IMPORTANT: store refresh_token as 5th argument
        this.auth.setToken(res.token, res.role, res.username, res.employee_id, res.refresh_token);
        this.router.navigate(['/']);
        this.showOverlay = false;
      },
      error: (err) => {
        this.showOverlay = false;
        // Show backend message if present
        this.error = err?.error?.msg || 'Invalid email or password';
      }
    });
  }

  goToRegister() {
    if (this.showOverlay) return;
    this.showOverlay = true;

    setTimeout(() => {
      this.router.navigate(['/register']);
      this.showOverlay = false;
    }, 300);
  }
}
