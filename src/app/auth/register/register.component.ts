import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { timer, Subscription } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  error = '';
  success = '';

  verificationMode = false;
  verificationCode = '';
  timerValue = 30;
  canResend = false;

  loadingRegister = false;
  loadingVerify = false;
  loadingResend = false;

  private timerSub?: Subscription;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    if (!this.username || !this.email || !this.password) {
      this.error = 'All fields are required!';
      return;
    }

    this.error = '';
    this.success = '';
    this.loadingRegister = true;

    // role is optional; backend infers Admin/Manager by password prefix if needed
    this.auth.register(this.username, this.email, this.password).subscribe({
      next: () => {
        this.loadingRegister = false;
        this.success = 'Verification code sent to your email!';
        this.verificationMode = true;
        this.startTimer();
      },
      error: (err: any) => {
        this.loadingRegister = false;
        this.error = err?.error?.msg || 'Failed to register. User may already exist.';
      }
    });
  }

  startTimer() {
    this.canResend = false;
    this.timerValue = 30;
    this.timerSub?.unsubscribe();
    this.timerSub = timer(0, 1000).subscribe(() => {
      this.timerValue--;
      if (this.timerValue <= 0) {
        this.canResend = true;
        this.timerSub?.unsubscribe();
      }
    });
  }

  resendCode() {
    if (!this.canResend || !this.email) return;
    this.loadingResend = true;

    this.auth.resendCode(this.email).subscribe({
      next: () => {
        this.loadingResend = false;
        this.success = 'New code sent!';
        this.startTimer();
      },
      error: (err) => {
        this.loadingResend = false;
        this.error = err?.error?.msg || 'Failed to resend code.';
      }
    });
  }

  verifyCode() {
    if (!this.verificationCode) {
      this.error = 'Please enter the verification code.';
      return;
    }
    if (!this.email) {
      this.error = 'Missing email for verification.';
      return;
    }

    this.error = '';
    this.loadingVerify = true;

    this.auth.verifyEmail(this.email, this.verificationCode).subscribe({
      next: () => {
        this.loadingVerify = false;
        alert('Email verified successfully! You can now login.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loadingVerify = false;
        this.error = err?.error?.msg || 'Verification failed.';
      }
    });
  }

  ngOnDestroy() {
    this.timerSub?.unsubscribe();
  }
}
