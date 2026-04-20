import { Component, ChangeDetectorRef } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule, ChevronUp, Send, ArrowLeft } from 'lucide-angular';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-contact',
  imports: [RouterLink, LucideAngularModule, ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class ContactComponent {
  readonly chevronUp = ChevronUp;
  readonly send = Send;
  readonly arrowLeft = ArrowLeft;

  isSubmitting = false;
  success = false;
  errorMessage = '';

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(3)]],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isSubmitting = true;
    this.errorMessage = '';
    this.http.post(`${environment.apiUrl}/contact`, this.form.value).subscribe({
      next: () => {
        this.success = true;
        this.isSubmitting = false;
        this.cdr.detectChanges();
        setTimeout(() => void this.router.navigate(['/']), 5000);
      },
      error: () => {
        this.errorMessage = 'Une erreur est survenue, veuillez réessayer.';
        this.isSubmitting = false;
      },
    });
  }
}
