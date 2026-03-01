import { Component, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.html',
})
export class App {
  constructor(public router: Router) {}

  get showNavbar(): boolean {
    return this.router.url !== '/login';
  }
}
