import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { AlertsStateService } from '../../../core/services/alerts-state.service';
import { LucideAngularModule, Package, Plus, User, LogOut, Bell } from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, LucideAngularModule, AsyncPipe],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent {
  readonly package = Package;
  readonly plus = Plus;
  readonly user = User;
  readonly logOut = LogOut;
  readonly bell = Bell;

  constructor(
    public router: Router,
    private authService: AuthService,
    public alertsStateService: AlertsStateService,
  ) {}

  get userInitial(): string {
    return (this.authService.getUser()?.first_name?.[0] ?? '?').toUpperCase();
  }

  get userName(): string {
    const u = this.authService.getUser();
    return u ? `${u.first_name} ${u.last_name}` : '';
  }

  get userEmail(): string {
    return this.authService.getUser()?.email ?? '';
  }

  isActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }

  logout(): void {
    this.authService.logout();
  }
}
