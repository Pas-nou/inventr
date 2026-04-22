import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export type OnboardingStep = 'first_asset' | 'first_document' | 'app_installed';

export interface OnboardingSteps {
  first_asset: boolean;
  first_document: boolean;
  app_installed: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class OnboardingService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  /**
   * Returns the current onboarding steps state from localStorage.
   * Returns null if the user has no onboarding data (existing users).
   */
  getSteps(): OnboardingSteps | null {
    const user = this.authService.getUser();
    return user?.onboarding_steps ?? null;
  }

  /**
   * Returns true if all onboarding steps are completed or if the user
   * has no onboarding data (existing users before the feature was added).
   */
  isCompleted(): boolean {
    const steps = this.getSteps();
    if (!steps) return true;
    return steps.first_asset && steps.first_document && steps.app_installed;
  }

  /**
   * Marks a step as completed both in the backend and in localStorage.
   */
  completeStep(step: OnboardingStep): void {
    this.http.patch(`${this.apiUrl}/onboarding/${step}`, {}).subscribe();

    const user = this.authService.getUser();
    if (!user) return;

    const current = user.onboarding_steps ?? {
      first_asset: false,
      first_document: false,
      app_installed: false,
    };

    const updated = { ...current, [step]: true };
    localStorage.setItem('user', JSON.stringify({ ...user, onboarding_steps: updated }));
  }
}