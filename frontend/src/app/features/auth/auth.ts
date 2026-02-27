import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class AuthComponent {
  isLogin = true;
  isLoading = false;
  errorMessage = '';

  loginForm: FormGroup;
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });

    this.registerForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)]],
      confirmPassword: ['', Validators.required],
    }, {validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  setLogin() {
    this.isLogin = true;
    this.errorMessage = '';
  }

  setRegister() {
    this.isLogin = false;
    this.errorMessage = '';
  }

  onSubmit() {
    if (this.isLogin) {
      if (this.loginForm.invalid) return;
      this.isLoading = true;
      this.authService.login(this.loginForm.value).subscribe({
        next: () => void this.router.navigate(['/home']),
        error: () => {
          this.errorMessage = 'Email ou mot de passe incorrect';
          this.isLoading = false;
        },
      });
    } else {
      if (this.registerForm.invalid) return;
      this.isLoading = true;
      const { confirmPassword: _, ...registerData } = this.registerForm.value;
      this.authService.register(registerData).subscribe({
        next: () => void this.router.navigate(['/home']),
        error: () => {
          this.errorMessage = 'Une erreur est survenue, veuillez réessayer';
          this.isLoading = false;
        },
      });
    }
  }
}
