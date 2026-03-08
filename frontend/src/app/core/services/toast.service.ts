import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error';

export interface Toast {
  message: string;
  type: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toast = signal<Toast | null>(null);

  private timer: ReturnType<typeof setTimeout> | null = null;
  
  show(message: string, type: ToastType = 'success'): void {
    
    if (this.timer) clearTimeout(this.timer);
    this.toast.set({ message, type });
    this.timer = setTimeout(() => this.toast.set(null), 3000);
  }

  hide(): void {
    this.toast.set(null);
  }
}
