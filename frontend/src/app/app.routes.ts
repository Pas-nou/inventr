import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { NotFoundComponent } from './features/not-found/not-found';
import { GuestGuard } from './core/guards/guest.guard';
import { AssetFormComponent } from './features/asset-form/asset-form';

export const routes: Routes = [
  {
    path: '',
    canActivate: [GuestGuard],
    loadComponent: () => import('./features/landing/landing').then((m) => m.LandingComponent),
  },
  {
    path: 'login',
    canActivate: [GuestGuard],
    loadComponent: () => import('./features/auth/auth').then((m) => m.AuthComponent),
  },
  {
    path: 'verify-email',
    canActivate: [GuestGuard],
    loadComponent: () =>
      import('./features/auth/verify-email/verify-email').then((m) => m.VerifyEmailComponent),
  },
  {
    path: 'forgot-password',
    canActivate: [GuestGuard],
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password').then(
        (m) => m.ForgotPasswordComponent,
      ),
  },
  {
    path: 'reset-password',
    canActivate: [GuestGuard],
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password').then((m) => m.ResetPasswordComponent),
  },
  {
    path: 'app',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/assets/assets').then((m) => m.AssetsComponent),
  },
  {
    path: 'alerts',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/alerts/alerts').then((m) => m.AlertsComponent),
  },
  {
    path: 'assets/new',
    canActivate: [AuthGuard],
    component: AssetFormComponent,
  },
  {
    path: 'assets/:id',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/assets/asset-detail/asset-detail').then((m) => m.AssetDetailComponent),
  },
  {
    path: 'assets/:id/edit',
    canActivate: [AuthGuard],
    component: AssetFormComponent,
  },
  {
    path: 'profile',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/profile/profile').then((m) => m.ProfileComponent),
  },
  {
    path: 'mentions-legales',
    loadComponent: () =>
      import('./features/legal/legal-notice/legal-notice').then((m) => m.LegalNoticeComponent),
  },
  {
    path: 'politique-confidentialite',
    loadComponent: () =>
      import('./features/legal/privacy-policy/privacy-policy').then(
        (m) => m.PrivacyPolicyComponent,
      ),
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/legal/contact/contact').then((m) => m.ContactComponent),
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];
