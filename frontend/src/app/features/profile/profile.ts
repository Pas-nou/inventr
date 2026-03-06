import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule, Pencil, Bell, LogOut, ChevronRight } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  imports: [LucideAngularModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent implements OnInit {
  readonly pencil = Pencil;
  readonly bell = Bell;
  readonly logOut = LogOut;
  readonly chevronRight = ChevronRight;

  firstName = '';
  lastName = '';
  email = '';
  initials = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.firstName = user.first_name;
      this.lastName = user.last_name;
      this.email = user.email;
      this.initials = user.first_name[0].toUpperCase();
    }
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}
