import { Component, inject, Inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';
import { LucideAngularModule, CircleCheck, CircleX, X } from 'lucide-angular';

@Component({
  selector: 'app-toast',
  imports: [LucideAngularModule],
  templateUrl: './toast.html',
  styleUrl: './toast.css',
})
export class ToastComponent {
  readonly toastService = inject(ToastService);
  readonly circleCheck = CircleCheck;
  readonly circleX = CircleX;
  readonly x = X;
}
