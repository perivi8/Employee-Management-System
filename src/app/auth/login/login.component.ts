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

    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        this.auth.setToken(res.token, res.role, res.username, res.employee_id);
        this.router.navigate(['/']);
        this.showOverlay = false;
      },
      error: () => {
        this.showOverlay = false;
        this.error = 'Invalid email or password';
      }
    });
  }

  goToRegister() {
    if (this.showOverlay) return;
    this.showOverlay = true;

    setTimeout(() => {
      this.router.navigate(['/register']);
      this.showOverlay = false;
    }, 500);
  }
}