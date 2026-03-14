import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';


type VerifyState = 'loading' | 'success' | 'expired' | 'error'

@Component({
  selector: 'app-verify-email',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.css',
})
export class VerifyEmailComponent implements OnInit {
  state: VerifyState = 'loading';
  isResending = false;
  resendSuccess = false;
  email = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.state = 'error';
      return;
    }
    this.authService.verifyEmail(token).subscribe({
      next: () => (this.state = 'success'),
      error: (err) => {
        const message = err?.error.message as string;
        this.state = message === 'TOKEN_EXPIRED' ? 'expired' : 'error';
      },
    });
  }

  resend(): void {
    if (!this.email || this.isResending) return;
    this.isResending = true;
    this.authService.resendVerification(this.email).subscribe({
      next: () => {
        this.isResending = false;
        this.resendSuccess = true;
      },
      error: () => {
        this.isResending = false;
      },
    });
  }
}
