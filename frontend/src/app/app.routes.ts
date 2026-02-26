import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
    },
    {
        path: 'login',
        loadComponent: () => import('./features/auth/auth').then(m => m.AuthComponent),
    },
    {
    path: 'home',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/assets/assets').then(m => m.AssetsComponent)
  },
  {
    path: 'home/:id',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/assets/asset-detail/asset-detail').then(m => m.AssetDetailComponent)
  },
  {
    path: 'profile',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/profile/profile').then(m => m.ProfileComponent)
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
