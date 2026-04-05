import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar';
import { ToastComponent } from './shared/components/toast/toast';
import { SidebarComponent } from './shared/components/sidebar/sidebar';
import { FooterComponent } from './shared/components/footer/footer';
import { NavbarPublicComponent } from './shared/components/navbar-public/navbar-public';
import { SwUpdate } from '@angular/service-worker';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent,
    ToastComponent,
    SidebarComponent,
    FooterComponent,
    NavbarPublicComponent,
  ],
  templateUrl: './app.html',
})
export class App {
  constructor(
    public router: Router,
    private swUpdate: SwUpdate,
    private authService: AuthService,
  ) {
    if (swUpdate.isEnabled) {
      swUpdate.versionUpdates.subscribe((event) => {
        if (event.type === 'VERSION_READY') {
          window.location.reload();
        }
      });
    }
  }

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  get showNavbar(): boolean {
    const hiddenRoutes = [
      '/login',
      '/assets/new',
      '/verify-email',
      '/forgot-password',
      '/reset-password',
    ];
    if (!this.isLoggedIn) return false;
    return (
      this.router.url !== '/' &&
      !hiddenRoutes.some((route) => this.router.url.startsWith(route)) &&
      !this.router.url.endsWith('/edit')
    );
  }

  get showSidebar(): boolean {
    const hiddenRoutes = ['/login', '/verify-email', '/forgot-password', '/reset-password'];
    if (!this.isLoggedIn) return false;
    return (
      this.router.url !== '/' && !hiddenRoutes.some((route) => this.router.url.startsWith(route))
    );
  }

  get showFooter(): boolean {
    const footerRoutes = [
      '/mentions-legales',
      '/politique-confidentialite',
      '/contact',
      '/changelog',
    ];
    return !this.isLoggedIn && footerRoutes.some((route) => this.router.url.startsWith(route));
  }

  get showPublicNavbar(): boolean {
    const publicNavRoutes = [
      '/mentions-legales',
      '/politique-confidentialite',
      '/contact',
      '/changelog',
    ];
    return !this.isLoggedIn && publicNavRoutes.some((route) => this.router.url.startsWith(route));
  }
}
