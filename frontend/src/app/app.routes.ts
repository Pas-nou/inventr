import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { NotFoundComponent } from './features/not-found/not-found';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/auth').then((m) => m.AuthComponent),
  },
  {
    path: 'verify-email',
    loadComponent: () =>
      import('./features/auth/verify-email/verify-email').then((m) => m.VerifyEmailComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () => 
      import('./features/auth/forgot-password/forgot-password').then((m) => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => 
      import('./features/auth/reset-password/reset-password').then((m) => m.ResetPasswordComponent)
  },
  {
    path: 'home',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/assets/assets').then((m) => m.AssetsComponent),
  },
  {
    path: 'assets/new',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/asset-form/asset-form').then((m) => m.AssetFormComponent),
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
    loadComponent: () =>
      import('./features/asset-form/asset-form').then((m) => m.AssetFormComponent),
  },
  {
    path: 'profile',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/profile/profile').then((m) => m.ProfileComponent),
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];
