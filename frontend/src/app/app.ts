import { Component, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar';
import { ToastComponent } from './shared/components/toast/toast';
import { SidebarComponent } from './shared/components/sidebar/sidebar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ToastComponent, SidebarComponent],
  templateUrl: './app.html',
})
export class App {
  constructor(public router: Router) {}

  get showNavbar(): boolean {
    const hiddenRoutes = [
      '/',
      '/login',
      '/assets/new',
      '/verify-email',
      '/forgot-password',
      '/reset-password',
      '/mentions-legales',
      '/politique-confidentialite',
      '/contact',
    ];
    return !hiddenRoutes.some(route => this.router.url.startsWith(route)) && !this.router.url.endsWith('/edit');
  }

  get showSidebar(): boolean {
    const hiddenRoutes = [
      '/',
      '/login',
      '/verify-email',
      '/forgot-password',
      '/reset-password',
      '/mentions-legales',
      '/politique-confidentialite',
      '/contact',
    ];
    return !hiddenRoutes.some(route => this.router.url.startsWith(route));
  }
}
