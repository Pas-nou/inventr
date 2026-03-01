import { Component } from '@angular/core';
import { LucideAngularModule, LayoutGrid, Plus, User } from 'lucide-angular';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [LucideAngularModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class NavbarComponent {
  readonly layoutGrid = LayoutGrid;
  readonly plus = Plus;
  readonly user = User;
}
